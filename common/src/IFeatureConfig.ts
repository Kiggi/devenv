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

export interface IFeatureBooleanOption {
  type: EFeatureOptionType.BOOLEAN;
  default?: boolean;
  description?: string;
}

export type IFeatureStringOption = {
  type: EFeatureOptionType.STRING;
  default?: string;
  description?: string;
} & ({
    proposals: string[];
  } | {
    enum: string[];
  } | {}
);

export type IFeatureOption = IFeatureBooleanOption | IFeatureStringOption;

// TODO
export interface IFeatureCustomizations { }

interface IFeatureConfig {
  id: string;
  version: string;
  name: string;
  description?: string;
  documentationURL?: string;
  licenseURL?: string;
  keywords?: string;
  options?: Record<string, IFeatureOption>;
  containerEnv: Record<string, string>;
  priviledged?: boolean;
  init?: boolean;
  capAdd?: string[];
  securityOpt?: string[];
  entrypoint?: string;
  customizations?: IFeatureCustomizations;
  dependsOn?: Record<string, Record<string, boolean | string>>;
  installsAfter?: string[];
  legacyIds?: string[];
  deprecated?: boolean;
  mounts?: IMountConfig[];
}

export default IFeatureConfig;
