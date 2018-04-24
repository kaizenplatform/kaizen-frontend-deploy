#!/usr/bin/env node


'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const path = require('path');
const commander = require('commander');
const chalk = require('chalk');
const camelcase = require('camelcase');

const s3 = require('./lib/s3');
const cloudfront = require('./lib/cloudfront');
const packageJson = require('../package.json');

let localDir;

const awsConfigurations = [{
  cliOption: '--aws-access-key-id',
  envVar: 'AWS_ACCESS_KEY_ID',
  description: 'AWS Access Key ID',
  boolean: false,
  required: true
}, {
  cliOption: '--aws-secret-access-key',
  envVar: 'AWS_SECRET_ACCESS_KEY',
  description: 'AWS secret key',
  boolean: false,
  required: true
}, {
  cliOption: '--s3-region',
  envVar: 'S3_REGION',
  description: 'S3 region name',
  boolean: false,
  required: true
}, {
  cliOption: '--s3-bucket',
  envVar: 'S3_BUCKET',
  description: 'S3 bucket name',
  boolean: false,
  required: true
}, {
  cliOption: '--cloudfront-distribution-id',
  envVar: 'CLOUDFRONT_DISTRIBUTION_ID',
  description: 'CloudFront distribution ID',
  boolean: false,
  required: true
}, {
  cliOption: '--s3-prefix',
  envVar: 'S3_PREFIX',
  description: 'Prefix which is added to the s3 directory',
  boolean: false,
  required: false
}, {
  cliOption: '--s3-delete-removed',
  envVar: 'S3_DELETE_REMOVED',
  description: 'Whether to remove s3 objects (default false)',
  boolean: true,
  required: false
}, {
  cliOption: '--skip-cloudfront',
  envVar: 'SKIP_CLOUDFRONT',
  description: 'Whether to skip cloudfront invalidation (default false)',
  boolean: true,
  required: false
}];

const program = new commander.Command(packageJson.name).version(packageJson.version).arguments('<local-directory>').usage(`${chalk.green('<local-directory>')} [options]`).action(dir => {
  localDir = path.resolve(process.cwd(), dir);
});

awsConfigurations.forEach(conf => {
  if (conf.boolean) {
    program.option(conf.cliOption, conf.description);
  } else {
    program.option(`${conf.cliOption} <value>`, conf.description);
  }
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
    if (program.skipCloudfront === true && conf.envVar === 'CLOUDFRONT_DISTRIBUTION_ID') {
      return; // Exit if no skip option and no cloudfront distribution id
    }
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
  console.log(`      ${chalk.cyan('https://github.com/kaizenplatform/kaizen-frontend-deploy#aws-credentials-and-configurations')}`);
  process.exit(1);
}

const AWS_ACCESS_KEY_ID = program.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = program.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
const S3_REGION = program.s3Region || process.env.S3_REGION;
const S3_BUCKET = program.s3Bucket || process.env.S3_BUCKET;
const S3_PREFIX = program.s3Prefix || process.env.S3_PREFIX;
const CLOUDFRONT_DISTRIBUTION_ID = program.cloudfrontDistributionId || process.env.CLOUDFRONT_DISTRIBUTION_ID;
const SKIP_CLOUDFRONT = program.skipCloudfront || process.env.SKIP_CLOUDFRONT;

const main = (() => {
  var _ref = _asyncToGenerator(function* () {
    try {
      const uploadedFiles = yield s3.upload(localDir, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_REGION, S3_BUCKET, S3_PREFIX);

      if (SKIP_CLOUDFRONT) {
        return;
      }

      yield cloudfront.invalidate(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, CLOUDFRONT_DISTRIBUTION_ID, S3_PREFIX, uploadedFiles);
    } catch (e) {
      console.error(e);
    }
  });

  return function main() {
    return _ref.apply(this, arguments);
  };
})();

main();