# kaizen-frontend-deploy

CLI tool for deploying SPA to Amazon S3 and CloudFront

## Usage

```bash
$ kaizen-frontend-deploy <build-directory> [options]
```

## AWS Credentials and Configurations

The CLI looks for AWS credentials and configuration settings in the following order:

1. **Command line options**

2. **Environment variables**

|Command line option|Environment variable|Description|Required?|Example|
|:--|:--|:--|:--|:--|
|`--aws-access-key-id`|`AWS_ACCESS_KEY_ID`|AWS access key|Yes|`AKIAIOSFODNN7EXAMPLE`|
|`--aws-secret-access-key`|`AWS_SECRET_ACCESS_KEY`|AWS secret key|Yes|`wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`|
|`--s3-region`|`S3_REGION`|S3 region name|Yes|`us-west-1`|
|`--s3-bucket`|`S3_BUCKET`|S3 bucket name|Yes|`account-web`|
|`--s3-prefix`|`S3_PREFIX`|Prefix which is added to the s3 directory|No|`popup/`|
|`--cloudfront-distribution-id`|`CLOUDFRONT_DISTRIBUTION_ID`|CloudFront distribution ID|Yes|`EDFDVBD6EXAMPLE`|
