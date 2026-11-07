import * as fs from 'node:fs';
import * as path from 'node:path';

type LogData = Record<string, unknown>;

const mode = process.argv.includes('--solver') ? 'solver' : 'human';
const startedAt = new Date();
const timestamp = startedAt.toISOString().replace(/[:.]/g, '-');
const logsDirectory = path.resolve(process.cwd(), 'logs');
const sessionId = `${mode}-${timestamp}-${process.pid}`;
const sessionDirectory = path.join(logsDirectory, sessionId);
const retainedSessions = mode === 'human' ? 20 : 10;

function isSessionActive(directory: string): boolean {
  const metadataPath = path.join(directory, 'session.json');
  if (!fs.existsSync(metadataPath)) {
    try {
      const age = Date.now() - fs.statSync(directory).mtimeMs;
      return age < 5 * 60 * 1000;
    } catch (error) {
      return (error as NodeJS.ErrnoException).code !== 'ENOENT';
    }
  }
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as {processId?: unknown};
    if (typeof metadata.processId !== 'number') return false;
    process.kill(metadata.processId, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code !== 'ESRCH';
  }
}

function rotateSessions(): void {
  fs.mkdirSync(logsDirectory, {recursive: true});
  const prefix = `${mode}-`;
  const sessions = fs.readdirSync(logsDirectory, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && entry.name.startsWith(prefix))
    .map(entry => entry.name)
    .sort();
  let remainingToDelete = Math.max(0, sessions.length - retainedSessions + 1);
  for (const expired of sessions) {
    if (remainingToDelete === 0) break;
    const expiredDirectory = path.join(logsDirectory, expired);
    if (isSessionActive(expiredDirectory)) continue;
    fs.rmSync(expiredDirectory, {recursive: true, force: true});
    remainingToDelete--;
  }
}

function normalizeFileName(fileName: string): string {
  return fileName.endsWith('.log') ? `${fileName.slice(0, -4)}.jsonl` : fileName;
}

rotateSessions();
fs.mkdirSync(sessionDirectory, {recursive: true});
fs.writeFileSync(path.join(sessionDirectory, 'session.json'), JSON.stringify({
  schemaVersion: 1,
  sessionId,
  mode,
  processId: process.pid,
  startedAt: startedAt.toISOString(),
}, null, 2));

export class Debug {
  private readonly filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(sessionDirectory, normalizeFileName(fileName));
  }

  event(event: string, data: LogData = {}): void {
    fs.appendFileSync(this.filePath, `${JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...data,
    })}\n`);
  }

  log(message: string): void {
    this.event('message', {message});
  }
}

export function getLogSessionDirectory(): string {
  return sessionDirectory;
}
