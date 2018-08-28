'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const AWS = require('aws-sdk');
const chalk = require('chalk');

module.exports = {
  invalidate: (() => {
    var _ref = _asyncToGenerator(function* (awsAccessKeyId, awsSecretAccessKey, distributionId, s3Prefix = '', invalidateAll = false, uploadedFiles = []) {
      return new Promise(function (resolve, reject) {
        console.log(chalk.cyan('\nInvalidating Cloudfront...'));

        let paths = {};

        if (invalidateAll) {
          console.log('Invalidating all files...');

          paths = {
            Quantity: 1, // Items array length below
            Items: ['/*'] // always invalidate all items
          };
        } else {
          if (uploadedFiles.length === 0) {
            console.log('No target files');
            console.log('✨  Done.');
            resolve();
            return;
          }

          const invalidateList = uploadedFiles.map(function (file) {
            return `/${file}`;
          });
          invalidateList.push(`/${s3Prefix}`);

          console.log('Invalidation items:');
          invalidateList.forEach(function (item) {
            console.log(chalk.gray(`  ${item}`));
          });

          paths = {
            Quantity: invalidateList.length,
            Items: invalidateList
          };
        }

        const cloudfront = new AWS.CloudFront({
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey
        });

        const params = {
          DistributionId: distributionId,
          InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: paths
          }
        };

        cloudfront.createInvalidation(params, function (err, data) {
          if (err) {
            console.error('Creating invalidation error', err.stack);
            process.exit(1);
          }
          console.log(chalk.green('Created invalidation successfully.'));
          console.log(chalk.gray(`  Invalidation ID: ${data.Invalidation.Id}`));
          console.log(chalk.gray(`  Object path:`));
          data.Invalidation.InvalidationBatch.Paths.Items.forEach(function (path) {
            console.log(chalk.gray(`    ${path}`));
          });
          console.log('Waiting for invalidation completed...');
          const params = {
            DistributionId: distributionId,
            Id: data.Invalidation.Id
          };
          cloudfront.waitFor('invalidationCompleted', params, function (err, data) {
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
    });

    function invalidate(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    }

    return invalidate;
  })()
};