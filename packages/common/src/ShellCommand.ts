import { $, ProcessPromise } from 'zx';

// TODO: Add config option to define a schema of how to build the command (incl. subcommands, required arguments/options, etc.)
// TODO: Add env variables support
export class ShellCommand {
  protected command: string;
  protected args: string[] = [];
  protected options: Record<string, string | string[]> = {};

  constructor(command: string) {
    if (!command || command.trim() === '')
      throw new Error('Command cannot be empty');
    this.command = command;
  }

  protected static valueIsNotEmpty(value: string | undefined): boolean {
    return value !== undefined && value !== null && value.trim() !== '';
  }

  /**
   * Add an option to the command.
   * @param name - The name of the option (e.g., '--verbose' or '-v').
   * @param value - The value of the option, if any. If omitted, the option is treated as a flag.
   * @returns The instance for chaining.
   */
  public addOption(name: string, value?: string): this {
    if (this.options[name]) {
      if (Array.isArray(this.options[name])) {
        // If the option already exists, add the new value to the existing array
        if (ShellCommand.valueIsNotEmpty(value)) this.options[name].push(value as string);
      } else {
        // If the option exists but is not an array, convert it to an array
        if (ShellCommand.valueIsNotEmpty(value)) this.options[name] = [this.options[name], value as string];
      }
    } else {
      // If the option doesn't exist, set it
      this.setOption(name, value);
    }
    return this;
  }

  public setOption(name: string, value?: string): this {
    this.options[name] = value || '';
    return this;
  }

  /**
   * Remove an option from the command.
   * @param name - The name of the option to remove.
   * @returns The instance for chaining.
   */
  public removeOption(name: string): this {
    delete this.options[name];
    return this;
  }

  /**
   * Add one or more arguments to the command.
   * @param args - One or more arguments to add.
   * @returns The instance for chaining.
   */
  public addArg(...args: string[]): this {
    this.args.push(...args);
    return this;
  }

  /**
   * Set the value of an argument at a specific index.
   * @param index - The index of the argument to set (0-based).
   * @param value - The new value for the argument.
   * @returns The instance for chaining.
   * @throws RangeError if the index is negative.
   */
  public setArg(index: number, value: string): this {
    if (index < 0) {
      throw new RangeError(`Index must be a positive number`);
    }

    this.args[index] = value;
    return this;
  }

  protected static quoteValue(value: string): string {
    // If the value contains spaces, wrap it in quotes
    if (value.includes(' ')) {
      return `"${value}"`;
    }
    return value;
  }

  protected parseArgs(): string {
    return (
      this.args
        // Remove undefined, null, or empty arguments
        .filter((arg) => ShellCommand.valueIsNotEmpty(arg))
        // If the argument contains a space, wrap it in quotes
        .map(ShellCommand.quoteValue)
        .join(' ')
    );
  }

  protected parseOptions(): string {
    return Object.entries(this.options)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          // If the value is an array, join the values with a space
          return value
            .map((v) => `${key} ${ShellCommand.quoteValue(v)}`)
            .join(' ');
        } else if (ShellCommand.valueIsNotEmpty(value)) {
          // If the value is a string, return the key and value
          return `${key} ${ShellCommand.quoteValue(value)}`;
        }
        // If the value is empty, return just the key (flag)
        return key;
      })
      .join(' ');
  }

  public parse(): string {
    let commandParts = [this.command, this.parseOptions(), this.parseArgs()];
    // Remove empty parts
    commandParts = commandParts.filter(ShellCommand.valueIsNotEmpty);
    // Join the command parts with a space
    return commandParts.join(' ');
  }

  /**
   * Run the command with the specified arguments and options
   * @returns A promise that resolves to the result of the command
   * @throws An error if the command fails
   * @example
   * ```ts
   * import shell from '@kiggi/cmd/Command';
   * const command = await shell('ls')
   *   .addOption('-l')
   *   .addArg('mydir')
   *   .run();
   * console.log(command.stdout);
   * ```
   */
  public run(): ProcessPromise {
    // Use zx to run the command
    // Use eval to execute command with the default quotes zx includes
    return $`eval ${this.parse()}`
  }

  /**
   * Check if the command exists in the system
   * @returns A promise that resolves to true if the command exists, false otherwise
   * @example
   * ```ts
   * import shell from '@kiggi/cmd/Command';
   * const command = shell('ls');
   * const exists = await command.exists();
   * console.log(`Command exists: ${exists}`);
   * ```
   */
  public async exists(): Promise<boolean> {
    const result = await $`command -v ${this.command}`.nothrow();
    return result.exitCode === 0;
  }
}

function shell(cmd: string): ShellCommand {
  return new ShellCommand(cmd);
}

export default shell;
