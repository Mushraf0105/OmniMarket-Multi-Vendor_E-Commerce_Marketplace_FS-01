import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const isS3Configured = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
);

let s3Client = null;
if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  console.log(`[AWS S3] Configured with bucket: ${process.env.AWS_S3_BUCKET}`);
} else {
  console.log('[AWS S3] AWS S3 credentials not provided. Using local disk storage fallback (/uploads).');
}

export const uploadFile = async (file) => {
  if (isS3Configured && s3Client) {
    const fileKey = `products/${Date.now()}-${path.basename(file.originalname).replace(/\s+/g, '_')}`;
    const fileStream = fs.createReadStream(file.path);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Body: fileStream,
      ContentType: file.mimetype
    });

    await s3Client.send(command);

    // Clean up temporary local file if created by multer
    try {
      fs.unlinkSync(file.path);
    } catch (e) {}

    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${fileKey}`;
  } else {
    // Local storage fallback: file is already stored in uploads/
    const filename = path.basename(file.path);
    return `/uploads/${filename}`;
  }
};
