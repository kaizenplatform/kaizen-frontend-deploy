#!/usr/bin/env bats

@test "no build directory" {
  run kaizen-frontend-deploy
  [ "$status" -eq 1 ]
  [ "${lines[0]}" = "Please specify the build directory:" ]
}

@test "no AWS credentials and configurations" {
  run kaizen-frontend-deploy test/fixtures/build
  [ "$status" -eq 1 ]
  [ "${lines[0]}" = "Please pass the AWS Credentials and Configurations:" ]
  [ "${lines[1]}" = "  - AWS Access Key ID: --aws-access-key-id or AWS_ACCESS_KEY_ID" ]
  [ "${lines[2]}" = "  - AWS secret key: --aws-secret-access-key or AWS_SECRET_ACCESS_KEY" ]
  [ "${lines[3]}" = "  - S3 region name: --s3-region or S3_REGION" ]
  [ "${lines[4]}" = "  - S3 bucket name: --s3-bucket or S3_BUCKET" ]
  [ "${lines[5]}" = "  - CloudFront distribution ID: --cloudfront-distribution-id or CLOUDFRONT_DISTRIBUTION_ID" ]
}

@test "no AWS credentials and configurations when skip-cloudfront option passed" {
  run kaizen-frontend-deploy test/fixtures/build --skip-cloudfront
  [ "$status" -eq 1 ]
  [ "${lines[0]}" = "Please pass the AWS Credentials and Configurations:" ]
  [ "${lines[1]}" = "  - AWS Access Key ID: --aws-access-key-id or AWS_ACCESS_KEY_ID" ]
  [ "${lines[2]}" = "  - AWS secret key: --aws-secret-access-key or AWS_SECRET_ACCESS_KEY" ]
  [ "${lines[3]}" = "  - S3 region name: --s3-region or S3_REGION" ]
  [ "${lines[4]}" = "  - S3 bucket name: --s3-bucket or S3_BUCKET" ]
}
