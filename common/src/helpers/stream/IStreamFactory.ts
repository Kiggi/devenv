import { Readable } from 'node:stream';

export interface IStreamFactory {
  getStream(ac: AbortController | undefined): Promise<Readable>;
}
