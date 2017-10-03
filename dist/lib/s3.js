'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const s3 = require('s3');
const chalk = require('chalk');

module.exports = {
  upload: (() => {
    var _ref = _asyncToGenerator(function* (localDir, awsAccessKeyId, awsSecretAccessKey, s3Region, s3Bukcet, s3Prefix) {
      return new Promise(function (resolve, reject) {
        console.log(chalk.cyan('\nUploading to S3...'));

        const client = s3.createClient({
          s3Options: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
            region: s3Region
          }
        });

        const uploadedFiles = [];
        const params = {
          localDir: localDir,
          s3Params: {
            Bucket: s3Bukcet,
            ACL: 'public-read',
            Prefix: s3Prefix
          }
        };
        console.log(localDir, params.s3Params);
        const uploader = client.uploadDir(params);
        uploader.on('error', function (err) {
          console.error(chalk.red('unable to sync:'), err.stack);
          reject(err.stack);
          process.exit(1);
        });

        uploader.on('fileUploadEnd', function (localFilePath, s3Key) {
          console.log(chalk.green('Uploaded'), `${localFilePath} -> ${s3Key}`);
          uploadedFiles.push(s3Key);
        });

        uploader.on('end', function () {
          console.log('✨  Done.');
          resolve(uploadedFiles);
        });
      });
    });

    function upload(_x, _x2, _x3, _x4, _x5, _x6) {
      return _ref.apply(this, arguments);
    }

    return upload;
  })()
};