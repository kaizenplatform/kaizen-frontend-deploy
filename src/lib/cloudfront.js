'use strict';

const AWS = require('aws-sdk');
const chalk = require('chalk');

module.exports = {
  invalidate: async function(
    awsAccessKeyId,
    awsSecretAccessKey,
    distributionId,
    s3Prefix = '',
    invalidateAll = false,
    uploadedFiles = [],
  ) {
    return new Promise((resolve, reject) => {
      console.log(chalk.cyan('\nInvalidating Cloudfront...'));

      let paths = {};

      if (invalidateAll) {
        console.log('Invalidating all files...');

        paths = {
          Quantity: 1, // Items array length below
          Items: ['/*'], // always invalidate all items
        };
      } else {
        if (uploadedFiles.length === 0) {
          console.log('No target files');
          console.log('✨  Done.');
          resolve();
          return;
        }

        const invalidateList = uploadedFiles.map(file => {
          return `/${file}`;
        });
        invalidateList.push(`/${s3Prefix}`);

        console.log('Invalidation items:');
        invalidateList.forEach(item => {
          console.log(chalk.gray(`  ${item}`));
        });

        paths = {
          Quantity: invalidateList.length,
          Items: invalidateList,
        };
      }

      const cloudfront = new AWS.CloudFront({
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      });

      const params = {
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: paths,
        },
      };

      cloudfront.createInvalidation(params, (err, data) => {
        if (err) {
          console.error('Creating invalidation error', err.stack);
          process.exit(1);
        }
        console.log(chalk.green('Created invalidation successfully.'));
        console.log(chalk.gray(`  Invalidation ID: ${data.Invalidation.Id}`));
        console.log(chalk.gray(`  Object path:`));
        data.Invalidation.InvalidationBatch.Paths.Items.forEach(path => {
          console.log(chalk.gray(`    ${path}`));
        });
        console.log('Waiting for invalidation completed...');
        const params = {
          DistributionId: distributionId,
          Id: data.Invalidation.Id,
        };
        cloudfront.waitFor('invalidationCompleted', params, (err, data) => {
          if (err) {
            console.error(chalk.red('Wating invalidationCompleted error'), err.stack);
            reject(err.stack);
            process.exit(1);
          }
          console.log('✨  Done.');
          resolve();
        });
      });
    });
  },
};
