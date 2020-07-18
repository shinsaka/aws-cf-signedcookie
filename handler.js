const AWS = require('aws-sdk');
const fs = require('fs');
const settings = require('./settings.json');

exports.handler = async (event, context, callback) => {
    console.log(JSON.stringify(event));
    const request = event.Records[0].cf.request;
    if (!['GET', 'HEAD'].includes(request.method) || request.uri !== '/enter') {
        return event.Records[0].cf.request;
    }
    // redirect response if uri matched
    const response = {
        status: '302',
        statusDescription: 'Found',
        headers: {
            'location': [{
                key: 'Location',
                value: '/index.html',
            }],
            'Set-Cookie': getSignedCookies(
                settings.keypairId,
                settings.privatekeyFile,
                settings.resource,
                5 * 60 + Math.floor(new Date().getTime() / 1000)
            )
        }
    };
    console.log(`## response=${JSON.stringify(response)}`);
    return response;
};

/**
 * @see: https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/private-content-setting-signed-cookie-custom-policy.html
 * @see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFront/Signer.html#getSignedCookie-property
 * @return: object below
 * [ { key: 'Set-Cookie', value: 'CloudFront-Policy=AAAAA; Path=/; Secure; HttpOnly' },
 *   { key: 'Set-Cookie', value: 'CloudFront-Key-Pair-Id=BBBBB; Path=/; Secure; HttpOnly' },
 *   { key: 'Set-Cookie', value: 'CloudFront-Signature=CCCCC; Path=/; Secure; HttpOnly' } ]
*/
const getSignedCookies = (keyPairId, privatekeyFile, resource, dateLessThan) => {
    const privateKey = fs.readFileSync(privatekeyFile);
    const policy = {Statement: [{
        Resource: resource,
        Condition: {
            DateLessThan: {'AWS:EpochTime': dateLessThan},
        }}]};
    const cfs = new AWS.CloudFront.Signer(keyPairId, privateKey);
    return Object.entries(
        cfs.getSignedCookie({policy: JSON.stringify(policy)})
    ).map(([k,v]) => {
        return { key: 'Set-Cookie', value: `${k}=${v}; Path=/; Secure; HttpOnly`};
    });
};
