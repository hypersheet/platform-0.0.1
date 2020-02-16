#!/usr/bin/env node

import * as fsSync from '@platform/cell.fs.sync/lib/cli';
import * as tmpl from './cli.tmpl';
import { cli } from './common';

const log = cli.log;

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', err => {
  throw err;
});

/**
 * Create a new "command-line-interface" application
 * and register commands from the various modules
 * within Cell/OS that expose a CLI/API.
 */
export const app = cli.create('cell');
fsSync.init(app.plugins);
tmpl.init(app.plugins);

// Log header (meta-data).
const pkg = require('../package.json') as { name: string; version: string };
const header = `${pkg.name}@${pkg.version}`;
log.info.gray(`${header}\n${log.magenta('━'.repeat(header.length))}\n`);

/**
 * Run the application.
 */
app.run();