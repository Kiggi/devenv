import { string, type StringSchema } from 'yup';
import { Readable } from 'node:stream';
import { getLogger } from 'log4js';
import { type IStreamFactory } from '.';

export class TextStreamFactory implements IStreamFactory {
  protected readonly logger = getLogger(TextStreamFactory.name);
  private readonly text: string;

  protected constructor(text: string) {
    // Unique ID for logging context instead of text to shorten logs
    this.logger.addContext('id', Date.now().toString(36));

    this.logger.debug(`Creating ${TextStreamFactory.name}...`);
    this.logger.trace('Text:', text);

    this.textSchema.validateSync(text);

    this.text = text;
  }

  protected get textSchema(): StringSchema {
    return string().required('Text cannot be empty');
  }

  public static create(text: string): TextStreamFactory {
    return new TextStreamFactory(text);
  }

  public async getStream(_: AbortController | undefined): Promise<Readable> {
    return Readable.from([this.text]);
  }
}
