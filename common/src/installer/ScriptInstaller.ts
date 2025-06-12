import { getLogger } from 'log4js';
import Installer, { type InstallerOptions } from './Installer';
import { type ProcessOutput } from 'zx';
import { type IStreamFactory } from '../helpers/stream';

/**
 * Installer for packages that are installed via a script
 */
// TODO: Add preflight check for curl
// TODO: Add config option for different executable name in PATH
// TODO: Consider using StreamInstaller as base class (e.g. .deb, .AppImage, etc.)
class ScriptInstaller extends Installer {
  protected override readonly logger = getLogger('AptInstaller');
  protected override readonly packageManager = 'apt';
  protected readonly streamFactory: IStreamFactory;

  constructor(
    packageName: string,
    streamFactory: IStreamFactory,
    opts: InstallerOptions = {}
  ) {
    super(packageName, opts);
    this.pkgNameSchema.validateSync(packageName);

    this.streamFactory = streamFactory;

    this.setupLogger({ packageManager: this.packageManager });
  }

  /**
   * Validate the package name.
   *
   * Script package names must consist of alphanumeric characters, dots, underscores, pluses, and hyphens.
   *
   * Call `.validateSync()` or `.validate()` to use this schema.
   * @returns A Yup string schema for validating the package name
   */
  protected override get pkgNameSchema() {
    return super.pkgNameSchema.matches(
      /^[a-zA-Z0-9._+-]+$/,
      'Invalid executable name'
    );
  }

  protected override async exists(): Promise<[boolean, ProcessOutput]> {
    this.logger.debug('Checking if already installed...');

    const processOutput = await this.$exec`which ${this.pkgName}`.nothrow();

    // If the package is not installed in $PATH, `which` will return a non-zero exit code
    return [processOutput.exitCode === 0, processOutput];
  }

  protected override async install(): Promise<ProcessOutput> {
    this.logger.debug('Installing package...');

    const stream = await this.streamFactory.getStream(this.abortController);

    const process = this.$exec`bash -s`;
    stream.pipe(process.stdin);

    return process;
  }
}

export default ScriptInstaller;
