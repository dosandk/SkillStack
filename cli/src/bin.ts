#!/usr/bin/env node

import { styleText } from 'node:util';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import chalk from 'chalk';
import { Command } from 'commander';

import { pull, push } from './commands';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PATH_PACKAGE_JSON = join(__dirname, '../package.json');
const pkg = JSON.parse(readFileSync(PATH_PACKAGE_JSON, 'utf-8'));
const pkgVersion = pkg.version || 'unknown';

const getCliMode = () => {
  return process.env.NODE_ENV === 'development' ? 'development' : 'production';
};

const program = new Command();

program.configureHelp({
  styleTitle: str => styleText('bold', str),
  styleCommandText: str => styleText('cyan', str),
  styleCommandDescription: str => styleText('magenta', str),
  styleOptionText: str => styleText('green', str),
  styleArgumentText: str => styleText('yellow', str),
  styleSubcommandText: str => styleText('blue', str)
});

process.on('unhandledRejection', error => {
  console.error(
    `[fatal] unhandledRejection: ${error?.stack || error?.message || error}`
  );
});

// Аварійні ситуації: краще залогувати і завершитись контрольовано
process.on('uncaughtException', error => {
  console.error(
    `[fatal] uncaughtException: ${error?.stack || error?.message || error}`
  );
});

// Ctrl+C
process.on('SIGINT', () => {
  console.error('[fatal] SIGINT');
  process.exit(0);
});

// pm2 stop / docker stop / systemd
process.on('SIGTERM', () => {
  console.error('[fatal] SIGTERM');
  process.exit(0);
});

program
  .name('skillstack')
  .description(`[${getCliMode()}] CLI`)
  .version(pkgVersion);

program
  .command('push')
  .description('push ai configs...')
  .action(async () => {
    // some logic here...
    push();
    console.log('push finished...');
  });

program
  .command('pull')
  .description('pull AI configs...')
  .option('--path <github_repo_repo>', 'link to the github repo')
  .action(async opts => {
    // some logic here
    pull();
    console.log('pull finished...');
  });

program.exitOverride(err => {
  if (err.code === 'commander.unknownCommand') {
    program.outputHelp({ error: true });
  }

  process.exit(err.exitCode ?? 1);
});

program.parseAsync(process.argv);
