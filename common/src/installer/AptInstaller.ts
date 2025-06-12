import { getLogger } from 'log4js';
import Installer, { type InstallerOptions } from './Installer';
import { type ProcessOutput } from 'zx';
import { type StringSchema } from 'yup';

/**
 * Installer for packages that are installed via `apt`
 */
// TODO: Add config option for versioning
class AptInstaller extends Installer {
  protected override readonly logger = getLogger('AptInstaller');
  protected override readonly packageManager = 'apt';

  constructor(packageName: string, opts: InstallerOptions = {}) {
    super(packageName, opts);
    this.pkgNameSchema.validateSync(packageName);

    // TODO: Add config options to log context
    this.setupLogger({ packageManager: this.packageManager });
  }

  /**
   * Validate the package name.
   *
   * Apt package names must start with a lowercase letter or digit,
   * followed by lowercase letters, digits, plus signs, dots, or hyphens.
   *
   * Call `.validateSync()` or `.validate()` to use this schema.
   * @returns A Yup string schema for validating the package name
   */
  protected override get pkgNameSchema(): StringSchema {
    return super.pkgNameSchema.matches(
      /^[a-z0-9][a-z0-9+.-]+$/,
      'Invalid apt package name'
    );
  }

  // TODO: Check if package is automatically installed
  protected override async exists(): Promise<[boolean, ProcessOutput]> {
    this.logger.debug('Checking if already installed...');

    // Check if the package is listed as installed
    // Format for manually installed packages is:
    // "<packageName>/<repository> <version> <arch> [installed]"
    const processOutput = await this.$exec`apt list --installed`.nothrow().pipe(
      `grep -x "^${this.pkgName}/.*\[installed\]$"`
    );

    // If the package is not installed, grep will return a non-zero exit code
    return [processOutput.exitCode === 0, processOutput];
  }

  protected override async install(): Promise<ProcessOutput> {
    this.logger.debug('Installing package with apt');
    
    return this.$exec`apt-get install -y ${this.pkgName}`;
  }
}

export default AptInstaller;
