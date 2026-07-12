const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // Only needed for temporary credentials (e.g. AWS Academy Learner Lab).
    // Leave AWS_SESSION_TOKEN unset for a normal IAM user's permanent keys.
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME;

// Generate a pre-signed URL the client can PUT a file to directly.
async function getUploadUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
}

// Generate a pre-signed URL the client can GET the file from directly.
// response-content-disposition forces the browser to download rather than preview inline.
async function getDownloadUrl(key, filename) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : 'attachment',
  });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

async function deleteObject(key) {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  return s3.send(command);
}

module.exports = { getUploadUrl, getDownloadUrl, deleteObject };
