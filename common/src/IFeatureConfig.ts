export enum EMountType {
  BIND = 'bind',
  VOLUME = 'volume',
}

export interface IMountConfig {
  source: string;
  target: string;
  type: EMountType;
}

export enum EFeatureOptionType {
  BOOLEAN = 'boolean',
  STRING = 'string',
}

export type IFeatureOptions = {description?: string} & ({
  type: EFeatureOptionType.BOOLEAN;
  default?: boolean;
} | {
  type: EFeatureOptionType.STRING;
  default?: string;
  proposals?: string[];
});

interface IFeatureConfig {
  id: string;
  version: string;
  name: string;
  description: string;
  mounts?: IMountConfig[];
  options?: Record<string, IFeatureOptions>;
}

export default IFeatureConfig;
