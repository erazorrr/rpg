import * as fs from "node:fs";
import * as path from "node:path";
import type {SaveFileV2} from "./save-data";

export interface SaveCodec<T> {
  serialize(): T;
  validate(value: unknown): asserts value is T;
}

/** Owns only the single save slot and atomic JSON replacement. */
export class SaveGameService {
  private readonly file = path.join(
    path.dirname(
      (process as NodeJS.Process & {pkg?: unknown}).pkg
        ? process.execPath
        : path.resolve(process.argv[1]),
    ),
    "save",
    "save.json",
  );

  public exists(): boolean {
    return fs.existsSync(this.file);
  }

  public inspect(validator: (value: unknown) => asserts value is SaveFileV2): {valid: boolean; error?: string} {
    if (!this.exists()) return {valid: false};
    try {
      this.read(validator);
      return {valid: true};
    } catch (error) {
      return {valid: false, error: error instanceof Error ? error.message : String(error)};
    }
  }

  public write(data: SaveFileV2, validator: (value: unknown) => asserts value is SaveFileV2): void {
    validator(data);
    const directory = path.dirname(this.file);
    const temporaryFile = `${this.file}.tmp`;
    fs.mkdirSync(directory, {recursive: true});

    try {
      fs.writeFileSync(temporaryFile, JSON.stringify(data), "utf8");
      fs.renameSync(temporaryFile, this.file);
    } catch (error) {
      try {
        fs.unlinkSync(temporaryFile);
      } catch {
        // The temporary file may not have been created.
      }
      throw error;
    }
  }

  public read(validator: (value: unknown) => asserts value is SaveFileV2): SaveFileV2 {
    const data: unknown = JSON.parse(fs.readFileSync(this.file, "utf8"));
    validator(data);
    return data;
  }

  public delete(): void {
    try {
      fs.unlinkSync(this.file);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}
