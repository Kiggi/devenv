import { isEqual } from 'lodash';
import { configure, getLogger, type Configuration } from 'log4js';

export const LoggerConfig: Configuration = {
  appenders: { default: { type: 'stdout', layout: { type: 'colored' } } },
  categories: { default: { appenders: ['default'], level: 'info' } },
};

export function initLogger(config: Partial<Configuration> = {}): void {
  const appliedConfig: Configuration = {
    ...LoggerConfig,
    ...config,
  };
  configure(appliedConfig);

  // Initialize the logger with the applied configuration
  const logger = getLogger();
  logger.info('Logger initialized', {
    config: appliedConfig,
  });

  if (!isEqual(config, {}))
    logger.debug('Custom Logger config applied', {
      override: config,
      default: LoggerConfig,
    });
}
