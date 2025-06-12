import { type Logger } from 'log4js';
import { string, type StringSchema } from 'yup';
import { $, type ProcessPromise } from 'zx';

export type InstallerOptions = Partial<{
  abortController: AbortController;
  longName: string;
}>;

// TODO: Add preflight checks for the package manager
abstract class Installer {
  protected abstract readonly logger: Logger;

  protected pkgName: string;
  /**
   * The descriptive and user-friendly name of the package.
   */
  protected longName?: string;
  protected abortController?: AbortController;

  /**
   * The package manager used for installation (e.g., 'apt', 'npm').
   * 
   * This should be defined in derived classes.
   */
  protected abstract readonly packageManager: string;

  /**
   * Get the package information string.
   * This method can be overridden in derived classes to provide custom package info.
   * @return A string representing the package information
   */
  protected get pkgInfo(): string {
    return this.longName ? `${this.pkgName} (${this.longName})` : this.pkgName;
  }

  /**
   * The `$` function from `zx` with the abort controller attached.
   * This allows for aborting the process if needed.
   */
  protected readonly $exec = $({ ac: this.abortController });

  protected constructor(packageName: string, opts: InstallerOptions = {}) {
    this.pkgName = packageName;
    this.pkgNameSchema.validateSync(packageName);

    this.longName = opts.longName;
    this.abortController = opts.abortController;
  }

  /**
   * Validate the package name.
   *
   * Call `.validateSync()` or `.validate()` to use this schema.
   * @returns A Yup string schema for validating the package name
   */
  protected get pkgNameSchema(): StringSchema {
    return string()
      .strict()
      .trim('Package name cannot have leading or trailing whitespace')
      .required('Package name is required');
  }

  /**
   * Initialize the logger with context for the package and package manager.
   * This method should be called in the constructor of derived classes.
   */
  protected setupLogger(context: Record<string, string>) {
    this.logger.addContext('package', this.pkgName);
    this.logger.addContext('packageManager', this.packageManager);

    // Add additional context if provided
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        this.logger.addContext(key, value);
      });
    }

    // Handle abort events
    this.abortController?.signal.addEventListener('abort', (e) => {
      this.logger.debug('Abort event received', e);

      this.onAbort(e);

      this.logger.error(`❗️ Installation aborted`);
    });

    this.logger.debug('Logger initialized');
  }

  /**
   * Handle the abort event.
   * This method can be overridden in derived classes to provide custom behavior.
   * @param event - The event object
   */
  protected onAbort(event: Event) {
    this.logger.debug('No abort handler defined');
  }

  /**
   * Check if the package is already installed.
   * This method should be implemented in derived classes.
   * @param ac - The AbortController to use for aborting the check
   * @return A promise that resolves to true if the package exists, false otherwise
   */
  protected abstract exists(): Promise<boolean>;

  /**
   * Install the package using the specified package manager.
   * This method should be implemented in derived classes.
   * @param ac - The AbortController to use for aborting the installation
   * @return A promise that resolves to the result of the installation process
   */
  protected abstract install(): Promise<ProcessPromise>;

  /**
   * Run the installation process.
   * This method checks if the package is already installed and, if not, proceeds with the installation.
   * @throws An error if the installation fails
   * @returns A promise that resolves when the installation is complete
   */
  public async run(): Promise<void> {
    this.logger.debug('Starting installation...');

    // If the package already exists, skip installation
    if (await this.exists()) {
      this.logger.info('✅ Package already installed, skipping...');
      return;
    }

    // Start the installation process
    this.logger.info(`🔧 Installing...`);
    try {
      const installResult = await this.install();

      this.logger.info('✅ Installation successful!');
      this.logger.trace('Output:', installResult.text());
    } catch (error) {
      this.logger.error('❌ Installation failed', error);
      throw new Error(`Failed to install ${this.pkgInfo}`, { cause: error });
    }
  }
}

export default Installer;
