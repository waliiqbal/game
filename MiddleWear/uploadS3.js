import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from './s3Client.js';

const upload = multer({ dest: 'uploads/' }); // temp storage before uploading to S3

const uploadToS3 = async (file) => {
  const fileStream = fs.createReadStream(file.path);
  const ext = path.extname(file.originalname);
  const filename = `${Date.now()}-${path.parse(file.originalname).name}${ext}`;
  const s3Key = `uploads/${filename}`;

  const uploadParams = {
    Bucket: 'gameofmind',
    Key: s3Key,
    Body: fileStream,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  // Clean up temp file
  fs.unlinkSync(file.path);

  return `https://gameofmind.s3.ap-south-1.amazonaws.com/${s3Key}`;
};

export { upload, uploadToS3 };
