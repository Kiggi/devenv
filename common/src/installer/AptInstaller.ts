import { getLogger } from 'log4js';
import Installer, { InstallerOptions } from './Installer';
import { ProcessPromise } from 'zx';

// TODO: Add config option for versioning
class AptInstaller extends Installer {
  protected readonly logger = getLogger('AptInstaller');
  protected readonly packageManager = 'apt';

  constructor(
    packageName: string,
    opts: InstallerOptions = {}
  ) {
    super(packageName, opts);
    this.setupLogger({ packageManager: this.packageManager });
  }

  /**
   * Check if the package is already installed.
   * @returns A promise that resolves to true if the package is installed, false otherwise.
   */
  // TODO: Check if package is automatically installed
  protected async exists(): Promise<boolean> {
    this.logger.debug('Checking if already installed');

    const $nothrow = this.$exec({
      nothrow: true,
    });

    const checkOutput = await $nothrow`apt list --installed`.pipe(
      `grep -x "^${this.pkgName}/.*\[installed\]$"`
    );

    return checkOutput.exitCode === 0;
  }

  /**
   * Install the package using apt.
   * @returns A promise that resolves when the installation is complete.
   */
  protected install(ac: AbortController | undefined): ProcessPromise {
    this.logger.debug('Installing package with apt');
    return this.$exec`apt-get install -y ${this.pkgName}`;
  }
}

export default AptInstaller;
