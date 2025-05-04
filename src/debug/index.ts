import * as fs from 'fs';

export class Debug {
  constructor(
    private readonly logFile = 'log.txt',
  ) {}

  log(message: string) {
    fs.appendFileSync(this.logFile, message + '\n');
  }
}
