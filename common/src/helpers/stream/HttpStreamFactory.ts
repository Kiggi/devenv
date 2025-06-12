import { string, type StringSchema } from 'yup';
import { Readable } from 'node:stream';
import { getLogger } from 'log4js';
import { type IStreamFactory } from '.';

export class HttpStreamFactory implements IStreamFactory {
  protected readonly logger = getLogger(HttpStreamFactory.name);
  protected readonly url: string;

  protected constructor(url: string) {
    this.logger.addContext('url', url);
    this.logger.debug(`Creating ${HttpStreamFactory.name}...`);

    this.urlSchema.validateSync(url);

    this.url = url;
  }

  protected get urlSchema(): StringSchema {
    return string()
      .strict()
      .trim('URL cannot have leading or trailing whitespace')
      .required('URL is required')
      .url('Invalid URL format');
  }

  public static create(url: string): HttpStreamFactory {
    return new HttpStreamFactory(url);
  }

  public async getStream(ac: AbortController | undefined): Promise<Readable> {
    this.logger.debug('Fetching stream...');

    const res = await fetch(this.url, {
      signal: ac?.signal,
    });

    this.logger.addContext('status', res.status);
    this.logger.trace('Response:', res);

    if (!res.ok) {
      this.logger.error('HTTP request failed');
      throw new Error('HTTP request failed: ' + res.statusText);
    }

    if (!res.body) {
      this.logger.error('HTTP response is empty');
      throw new Error('Response body is empty for ${url}');
    }

    return Readable.from(res.body);
  }
}
