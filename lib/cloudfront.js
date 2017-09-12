'use strict'

const AWS = require('aws-sdk')
const recursive = require('recursive-readdir')
const chalk = require('chalk')

module.exports = {
  invalidate: function(localDir, awsAccessKeyId, awsSecretAccessKey, distributionId, s3Prefix = '') {
    console.log(chalk.cyan('\nInvalidating Cloudfront...'))

    const cloudfront = new AWS.CloudFront({
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    })
    const invalidateList = [`${s3Prefix}/`]

    recursive(localDir, (err, files) => {
      if (err) {
        console.error(chalk.red(err))
        process.exit(1)
      }

      files.forEach(file => {
        invalidateList.push(file.replace(/${localDir}/, s3Prefix))
      })
    })

    const params = {
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: invalidateList.length,
          Items: invalidateList,
        },
      },
    }
    cloudfront.createInvalidation(params, (err, data) => {
      if (err) {
        console.error('creating invalidation error', err.stack)
        process.exit(1)
      }
      console.log(chalk.green('Created invalidation successfully.'))
      console.log(chalk.gray(`  Invalidation ID: ${data.Invalidation.Id}\n`))
      console.log('Waiting for completed.')
      const params = {
        DistributionId: distributionId,
        Id: data.Invalidation.Id,
      }
      cloudfront.waitFor('invalidationCompleted', params, (err, data) => {
        if (err) {
          console.error(chalk.red('Wating invalidationCompleted error'), err.stack)
          process.exit(1)
        }
        console.log('✨  Done.')
      })
    })
  },
}