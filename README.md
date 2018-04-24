# kaizen-frontend-deploy

CLI tool for deploying SPA to Amazon S3 and CloudFront

## Installation

```bash
$ npm install --save-dev kaizenplatform/kaizen-frontend-deploy
```

## Usage

```bash
$ kaizen-frontend-deploy <build-directory> [options]
```

## AWS Credentials and Configurations

The CLI looks for AWS credentials and configuration settings in the following order:

1. **Command line options**
2. **Environment variables**

### Required

|Command line option|Environment variable|Description|Example|
|:--|:--|:--|:--|
|`--aws-access-key-id`|`AWS_ACCESS_KEY_ID`|AWS access key|`AKIAIOSFODNN7EXAMPLE`|
|`--aws-secret-access-key`|`AWS_SECRET_ACCESS_KEY`|AWS secret key|`wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`|
|`--s3-region`|`S3_REGION`|S3 region name|`us-west-1`|
|`--s3-bucket`|`S3_BUCKET`|S3 bucket name|`account-web`|
|`--cloudfront-distribution-id`|`CLOUDFRONT_DISTRIBUTION_ID`|CloudFront distribution ID|`EDFDVBD6EXAMPLE`|


### Optional

|Command line option|Environment variable|Description|Example|
|:--|:--|:--|:--|
|`--s3-prefix`|`S3_PREFIX`|Prefix which is added to the s3 directory|`popup/`|
|`--skip-cloudfront`|`SKIP_CLOUDFRONT`|Whether to skip cloudfront invalidation|no value|

## Development

### Installation

```bash
$ npm install
$ ./scripts/install-bats.sh  # Install Bats for testing
```

### Testing

```bash
$ npm run test
```

### Releasing a new version

Please follow by [SemVer](http://semver.org/) to decide the version number.

```bash
$ git checkout master
$ npm version [major | minor | patch] # see https://docs.npmjs.com/cli/version for more details
```

## References

- [[engineering] kaizen-frontend-deploy というコマンドラインツールを作った](https://kaizen.qiita.com/jimbo/items/6ce7278926fdccce406d)
