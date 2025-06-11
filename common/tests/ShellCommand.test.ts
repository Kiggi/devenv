import { test, describe, expect } from 'vitest';
import shell, { ShellCommand } from '../src/ShellCommand';

describe('shell()', () => {
  test('should create a ShellCommand instance', () => {
    const cmd = shell('echo');
    expect(cmd).toBeInstanceOf(ShellCommand);
  });

  test('should throw an error if command is empty', () => {
    expect(() => shell('')).toThrow(Error);
  });
});

describe('new ShellCommand()', () => {
  test('should create a ShellCommand instance', () => {
    const cmd = new ShellCommand('echo');
    expect(cmd).toBeInstanceOf(ShellCommand);
  });

  test('should throw an error if command is empty', () => {
    expect(() => new ShellCommand('')).toThrow(Error);
  });
});

describe('ShellCommand.addOption()', () => {
  test('should add an option to the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.addOption('--verbose', 'true');
    expect(cmd.parse()).toEqual('echo --verbose true');
  });

  test('should add a flag option to the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.addOption('-v');
    expect(cmd.parse()).toEqual('echo -v');
  });

  test('should add multiple options to the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.addOption('--verbose', 'true').addOption('-v');
    expect(cmd.parse()).toEqual('echo --verbose true -v');
  });

  test('should add an option with a space in the value', () => {
    const cmd = new ShellCommand('echo');
    cmd.addOption('--message', 'Hello World');
    expect(cmd.parse()).toEqual('echo --message "Hello World"');
  });

  test('should add option multiple times', () => {
    const cmd = new ShellCommand('echo');
    cmd.addOption('-e', '1').addOption('-e', '2').addOption('-e', '3');
    expect(cmd.parse()).toEqual('echo -e 1 -e 2 -e 3');
  });

  test('should not add flag multiple times', () => {
    const cmd = new ShellCommand('echo');
    cmd.addOption('-e').addOption('-e');
    expect(cmd.parse()).toEqual('echo -e');
  });

  test('should not add flag, if option with value is set', () => {
    const cmd = new ShellCommand('echo');
    cmd
      .addOption('-e', '1')
      .addOption('-e')
      .addOption('-e', '')
      .addOption('-e', ' ');
    expect(cmd.parse()).toEqual('echo -e 1');
  });

  test('should not throw an error if the option is empty', () => {
    const cmd = new ShellCommand('echo');
    expect(() => cmd.addOption('')).not.toThrow();
  });
});

describe('ShellCommand.setOption()', () => {
  test('should set an option to the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.setOption('--verbose', 'true');
    expect(cmd.parse()).toEqual('echo --verbose true');
  });

  test('should set a flag option to the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.setOption('-v');
    expect(cmd.parse()).toEqual('echo -v');
  });

  test('should set an option with a space in the value', () => {
    const cmd = new ShellCommand('echo');
    cmd.setOption('--message', 'Hello World');
    expect(cmd.parse()).toEqual('echo --message "Hello World"');
  });

  test('should set option only once', () => {
    const cmd = new ShellCommand('echo');
    cmd.setOption('-e', '1').setOption('-e', '2');
    expect(cmd.parse()).toEqual('echo -e 2');
  });

  test('should not throw an error if the option is empty', () => {
    const cmd = new ShellCommand('echo');
    expect(() => cmd.setOption('')).not.toThrow();
  });
});

describe('ShellCommand.removeOption()', () => {
  test('should remove an option from the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.addOption('--verbose', 'true').removeOption('--verbose');
    expect(cmd.parse()).toEqual('echo');
  });

  test('should remove a flag option from the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.addOption('-v').removeOption('-v');
    expect(cmd.parse()).toEqual('echo');
  });

  test('should not throw an error if the option does not exist', () => {
    const cmd = new ShellCommand('echo');
    expect(() => cmd.removeOption('--nonexistent')).not.toThrow();
  });
});

describe('ShellCommand.addArg()', () => {
  test('should add an argument to the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.addArg('Hello');
    expect(cmd.parse()).toEqual('echo Hello');
  });

  test('should add multiple arguments to the command', () => {
    const cmd = new ShellCommand('echo');
    cmd.addArg('Hello', 'World');
    expect(cmd.parse()).toEqual('echo Hello World');
  });

  test('should add an argument with a space in the value', () => {
    const cmd = new ShellCommand('echo');
    cmd.addArg('Hello World');
    expect(cmd.parse()).toEqual('echo "Hello World"');
  });
});

describe('ShellCommand.setArg()', () => {
  test('should set an argument at a specific index', () => {
    const cmd = new ShellCommand('echo');
    cmd.addArg('Hello').setArg(0, 'World');
    expect(cmd.parse()).toEqual('echo World');
  });

  test('should set an argument with a space in the value', () => {
    const cmd = new ShellCommand('echo');
    cmd.addArg('Hello').setArg(0, 'Hello World');
    expect(cmd.parse()).toEqual('echo "Hello World"');
  });

  test('should not throw an error if the index is out of bounds', () => {
    const cmd = new ShellCommand('echo');
    expect(() => cmd.setArg(5, 'Hello')).not.toThrow();
  });

  test('should throw an error if the index is negative', () => {
    const cmd = new ShellCommand('echo');
    expect(() => cmd.setArg(-1, 'Hello')).toThrow(RangeError);
  });

  test('should handle empty arguments', () => {
    const cmd = new ShellCommand('echo');
    cmd.setArg(0, '');
    expect(cmd.parse()).toEqual('echo');
  });

  test('should allow unsetting arguments', () => {
    const cmd = new ShellCommand('echo');
    cmd.addArg('Hello').setArg(0, '');
    expect(cmd.parse()).toEqual('echo');
  });

  test('should handle argument with higher index', () => {
    const cmd = new ShellCommand('echo');
    cmd.setArg(5, 'test');
    expect(cmd.parse()).toEqual('echo test');
  });
});

describe('ShellCommand.exists()', () => {
  test('should return true for existing command', () => {
    const cmd = new ShellCommand('echo');
    expect(cmd.exists()).resolves.toBe(true);
  });

  test('should return false for non-existing command', () => {
    const cmd = new ShellCommand('nonexistentcommand');
    expect(cmd.exists()).resolves.toBe(false);
  });
});

describe('ShellCommand.run()', () => {
  test('should run the command and return the output', async () => {
    const cmd = new ShellCommand('echo');
    const output = await cmd.addArg('Hello World').run();
    expect(output.stdout).toEqual('Hello World\n');
  });

  test('should run the command with options and return the output', async () => {
    const cmd = new ShellCommand('echo');
    const output = await cmd.addOption('-n').addArg('Hello').run();
    expect(output.stdout).toEqual('Hello');
  });

  test('should throw an error if the command fails', async () => {
    const cmd = new ShellCommand('nonexistentcommand');
    await expect(cmd.run()).rejects.toThrow(Error);
  });
}
);
