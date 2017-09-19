#!/usr/bin/env node

'use strict';

const commander = require('commander');
const chalk = require('chalk');
const camelcase = require('camelcase');

const s3 = require('./lib/s3');
const cloudfront = require('./lib/cloudfront');
const packageJson = require('../package.json');

let localDir;

const awsConfigurations = [
  {
    cliOption: '--aws-access-key-id',
    envVar: 'AWS_ACCESS_KEY_ID',
    description: 'AWS Access Key ID',
    required: true,
  },
  {
    cliOption: '--aws-secret-access-key',
    envVar: 'AWS_SECRET_ACCESS_KEY',
    description: 'AWS secret key',
    required: true,
  },
  {
    cliOption: '--s3-region',
    envVar: 'S3_REGION',
    description: 'S3 region name',
    required: true,
  },
  {
    cliOption: '--s3-bucket',
    envVar: 'S3_BUCKET',
    description: 'S3 bucket name',
    required: true,
  },
  {
    cliOption: '--cloudfront-distribution-id',
    envVar: 'CLOUDFRONT_DISTRIBUTION_ID',
    description: 'CloudFront distribution ID',
    required: true,
  },
  {
    cliOption: '--s3-prefix',
    envVar: 'S3_PREFIX',
    description: 'Prefix which is added to the s3 directory',
    required: false,
  },
  {
    cliOption: '--s3-delete-removed',
    envVar: 'S3_DELETE_REMOVED',
    description: 'Whether to remove s3 objects (default false)',
    required: false,
  },
];

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<local-directory>')
  .usage(`${chalk.green('<local-directory>')} [options]`)
  .action(dir => {
    localDir = dir;
  });

awsConfigurations.forEach(conf => {
  program.option(`${conf.cliOption} <value>`, conf.description);
});

program.parse(process.argv);

if (typeof localDir === 'undefined') {
  console.error(`${chalk.red('Please specify the build directory:')}`);
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<local-directory>')}`);
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('build/')}`);
  console.log();
  console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
  process.exit(1);
}

const missingConfigurations = [];
awsConfigurations.forEach(conf => {
  if (conf.required) {
    if (typeof program[camelcase(conf.cliOption)] === 'undefined' && typeof process.env[conf.envVar] === 'undefined') {
      missingConfigurations.push(conf);
    }
  }
});

if (missingConfigurations.length > 0) {
  console.log();
  console.error(chalk.red(`Please pass the AWS Credentials and Configurations:`));
  console.log();
  missingConfigurations.forEach(conf => {
    console.log(`  - ${conf.description}: ${chalk.cyan(conf.cliOption)} or ${chalk.cyan(conf.envVar)}`);
  });
  console.log();
  console.log(`    Please check the readme file for more details:`);
  console.log(
    `      ${chalk.cyan(
      'https://github.com/kaizenplatform/kaizen-frontend-deploy#aws-credentials-and-configurations',
    )}`,
  );
  process.exit(1);
}

const AWS_ACCESS_KEY_ID = program.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = program.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
const S3_REGION = program.s3Region || process.env.S3_REGION;
const S3_BUCKET = program.s3Bucket || process.env.S3_BUCKET;
const S3_PREFIX = program.s3Prefix || process.env.S3_PREFIX;
const CLOUDFRONT_DISTRIBUTION_ID = program.cloudfrontDistributionId || process.env.CLOUDFRONT_DISTRIBUTION_ID;

const dir = localDir.replace(/\/$/, '');
let s3Prefix = '';
if (S3_PREFIX) {
  s3Prefix = S3_PREFIX.replace(/\/$/, '');
  s3Prefix = s3Prefix.match(/^\//) ? s3Prefix : `/${s3Prefix}`;
}

const main = async () => {
  try {
    await s3.upload(dir, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_REGION, S3_BUCKET, s3Prefix);
    await cloudfront.invalidate(dir, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, CLOUDFRONT_DISTRIBUTION_ID, s3Prefix);
  } catch (e) {
    console.error(e);
  }
};

main();
