import * as fs from 'fs';

export class Debug {
  constructor(
    private readonly logFile: string,
  ) {
    fs.writeFileSync(this.logFile, '');
  }

  log(message: string) {
    fs.appendFileSync(this.logFile, `${new Date().toISOString()}: ${message}\n`);
  }
}
