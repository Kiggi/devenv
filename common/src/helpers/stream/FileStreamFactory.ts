import { string, type StringSchema } from 'yup';
import { Readable } from 'node:stream';
import { getLogger } from 'log4js';
import path from 'node:path';
import fs from 'node:fs';
import { type IStreamFactory } from '.';

export class FileStreamFactory implements IStreamFactory {
  protected readonly logger = getLogger(FileStreamFactory.name);
  private readonly filePath: string;

  protected constructor(filePath: string) {
    this.logger.addContext('file', filePath);

    this.logger.debug(`Creating ${FileStreamFactory.name}...`);

    this.filePathValidator.validateSync(filePath);

    this.filePath = filePath;
  }

  protected get filePathValidator(): StringSchema {
    return string()
      .strict()
      .trim('File path cannot have leading or trailing whitespace')
      .required('File path is required')
      .test('is-absolute', 'File path must be absolute', (value) =>
        path.isAbsolute(value)
      );
  }

  public static create(filePath: string): FileStreamFactory {
    return new FileStreamFactory(filePath);
  }

  public async getStream(ac: AbortController | undefined): Promise<Readable> {
    this.logger.debug('Creating stream from file...');

    return fs.createReadStream(this.filePath, { signal: ac?.signal });
  }
}
