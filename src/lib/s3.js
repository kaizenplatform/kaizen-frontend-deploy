'use strict';

const s3 = require('s3');
const chalk = require('chalk');

module.exports = {
  upload: async function(localDir, awsAccessKeyId, awsSecretAccessKey, s3Region, s3Bukcet, s3Prefix) {
    return new Promise((resolve, reject) => {
      console.log(chalk.cyan('\nUploading to S3...'));

      const client = s3.createClient({
        s3Options: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
          region: s3Region,
        },
      });

      const params = {
        localDir: localDir,
        s3Params: {
          Bucket: s3Bukcet,
          ACL: 'public-read',
          Prefix: s3Prefix,
        },
      };
      const uploader = client.uploadDir(params);
      uploader.on('error', function(err) {
        console.error(chalk.red('unable to sync:'), err.stack);
        reject(err.stack);
        process.exit(1);
      });

      uploader.on('fileUploadEnd', (localFilePath, s3Key) => {
        console.log(chalk.green('Uploaded'), localFilePath);
      });

      uploader.on('end', function() {
        console.log('✨  Done.');
        resolve();
      });
    });
  },
};
