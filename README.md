# aws-cf-signedcocokie

## About
- A scheme of Serving Private web pages with serverless.


## Deploy

### Prepare

- Create and get a CloudFront Private-Key(APKxxxxx.pem)
    https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-trusted-signers.html#private-content-creating-cloudfront-key-pairs-procedure

- Copy `sample_settings.json` to `settings.json` and edit parameter
  - keypairId
  - privatekeyFile
  - resource

## Lambda Function Deploy

- Use a [Serverless Framework](https://www.serverless.com/)
- Copy a Private-key file to same directory.

```
$ serverless deploy --pkfile APKXXXXXXXXXXXXXXXXX.pem
```

## CloudFront Setting

- Create Cache Behavior
  - Path Pattern
    - `/enter`
  - Lambda Function Associations
    - CloudFront Event
      - Viewer Request
    - Lambda Function ARN
      - Lambda Function ARN with version
      - e.g) arn:aws:lambda:us-east-1:000000000000:function:AwsCfSignedcookie-dev-enter:1
  - Commit and wait

