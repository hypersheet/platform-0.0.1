import { expect } from 'chai';
import { Command } from '.';

describe('Command', () => {
  it('creates with no parts', () => {
    const cmd = Command.create();
    expect(cmd.parts).to.eql([]);
  });

  it('adds a command (trimmed)', () => {
    const cmd = Command.create().add('  run  ');
    expect(cmd.parts.length).to.eql(1);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
  });

  it('adds two commands', () => {
    const cmd = Command.create()
      .add('  run  ')
      .add('now');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('now');
    expect(cmd.parts[1].type).to.eql('COMMAND');
  });

  it('adds flag (--force)', () => {
    const cmd = Command.create()
      .add('run')
      .add(' --force   ');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('--force');
    expect(cmd.parts[1].type).to.eql('FLAG');
  });

  it('adds flag (-f)', () => {
    const cmd = Command.create()
      .add('run')
      .add(' -f   ');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('-f');
    expect(cmd.parts[1].type).to.eql('FLAG');
  });

  it('adds argument (--dir=foo)', () => {
    const cmd = Command.create()
      .add('run')
      .add('  --dir=foo   ');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('--dir=foo');
    expect(cmd.parts[1].type).to.eql('ARG');
  });

  it('adds argument (--dir foo)', () => {
    const cmd = Command.create()
      .add('run')
      .add('  --dir foo   ');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('--dir foo');
    expect(cmd.parts[1].type).to.eql('ARG');
  });

  it('conditional adding', () => {
    const cmd = Command.create()
      .add('run')
      .add('--force', false)
      .add('--dir 1234', true);
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('--dir 1234');
    expect(cmd.parts[1].type).to.eql('ARG');
  });

  it('trims line-break from added values', () => {
    const cmd = Command.create()
      .add('\n  run \n\n')
      .add('  --force \n  \n')
      .add('   \n\n \n--dir \n1234');
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[1].value).to.eql('--force');
    expect(cmd.parts[2].value).to.eql('--dir 1234');
  });

  it('does not add a line break if the command is empty', () => {
    const cmd = Command.create()
      .newLine()
      .add('run');
    expect(cmd.parts.length).to.eql(1);
    expect(cmd.parts[0].value).to.eql('run');
  });

  it('adds a line break', () => {
    const cmd = Command.create()
      .newLine()
      .add('run')
      .newLine()
      .add('delete');
    expect(cmd.parts[0].value).to.eql('run\n');
    expect(cmd.parts[1].value).to.eql('delete');
  });

  it('toString (empty)', () => {
    const cmd = Command.create();
    expect(cmd.toString()).to.eql('');
  });

  it('toString (single command)', () => {
    const cmd = Command.create().add('  build  ');
    expect(cmd.toString()).to.eql('build');
  });

  it('toString (command, arg, flag)', () => {
    const cmd = Command.create()
      .add('  build  ')
      .add('--force')
      .add('--dir=123');
    expect(cmd.toString()).to.eql('build --force --dir=123');
  });
});
