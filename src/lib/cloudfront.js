'use strict';

const AWS = require('aws-sdk');
const chalk = require('chalk');

module.exports = {
  invalidate: async function(awsAccessKeyId, awsSecretAccessKey, distributionId, s3Prefix = '', uploadedFiles = []) {
    return new Promise((resolve, reject) => {
      console.log(chalk.cyan('\nInvalidating Cloudfront...'));

      if (uploadedFiles.length === 0) {
        console.log('No target files');
        console.log('✨  Done.');
        resolve();
        return;
      }

      const cloudfront = new AWS.CloudFront({
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      });
      const invalidateList = uploadedFiles.map(file => {
        return `/${file}`;
      });
      invalidateList.push(`/${s3Prefix}`);

      console.log('Invalidation items:');
      invalidateList.forEach(item => {
        console.log(chalk.gray(`  ${item}`));
      });

      const params = {
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: {
            Quantity: invalidateList.length,
            Items: invalidateList,
          },
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
