import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from './s3Client.js';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';

// Set paths for ffmpeg and ffprobe binaries
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Multer setup for temporary uploads
const upload = multer({ dest: 'uploads/' });

// Convert GIF to MP4 using fluent-ffmpeg
const convertGifToMp4 = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = `${inputPath}.mp4`;
    ffmpeg(inputPath)
      .outputOptions([
        '-movflags faststart',               // for progressive streaming
        '-pix_fmt yuv420p',                  // ensure compatibility
        '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2' // even dimensions
      ])
      .toFormat('mp4')
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err));
  });
};

// Upload (and convert if needed) to S3
const uploadToS3 = async (file) => {
  let filePath = file.path;
  let originalName = path.parse(file.originalname).name;
  let ext = path.extname(file.originalname).toLowerCase();

  // If the uploaded file is a GIF, convert it first
  if (ext === '.gif' || file.mimetype === 'image/gif') {
    try {
      filePath = await convertGifToMp4(file.path);
      ext = '.mp4';
      originalName += '-converted';
    } catch (err) {
      fs.unlinkSync(file.path);
      throw new Error(`Failed to convert GIF to MP4: ${err.message}`);
    }
  }

  const fileStream = fs.createReadStream(filePath);
  const filename = `${Date.now()}-${originalName}${ext}`;
  const s3Key = `uploads/${filename}`;

  const uploadParams = {
    Bucket: 'gameofmind',
    Key: s3Key,
    Body: fileStream,
    ContentType: ext === '.mp4' ? 'video/mp4' : file.mimetype,
    ACL: 'public-read',
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  // Clean up temporary files
  fs.unlinkSync(file.path);
  if (filePath !== file.path) fs.unlinkSync(filePath);

  return `https://gameofmind.s3.ap-south-1.amazonaws.com/${s3Key}`;
};

export { upload, uploadToS3 };

























// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import s3Client from './s3Client.js';

// const upload = multer({ dest: 'uploads/' }); // temp storage before uploading to S3

// const uploadToS3 = async (file) => {
//   const fileStream = fs.createReadStream(file.path);
//   const ext = path.extname(file.originalname);
//   const filename = `${Date.now()}-${path.parse(file.originalname).name}${ext}`;
//   const s3Key = `uploads/${filename}`;

//   const uploadParams = {
//     Bucket: 'gameofmind',
//     Key: s3Key,
//     Body: fileStream,
//     ContentType: file.mimetype,
//     ACL: 'public-read',
//   };

//   await s3Client.send(new PutObjectCommand(uploadParams));

//   // Clean up temp file
//   fs.unlinkSync(file.path);

//   return `https://gameofmind.s3.ap-south-1.amazonaws.com/${s3Key}`;
// };

// export { upload, uploadToS3 };


