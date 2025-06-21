import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png'];
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
  const { path: tempPath, mimetype, originalname } = file;
  let ext = path.extname(originalname).toLowerCase();
  let processingPath = tempPath;

  // 1) GIF → MP4 conversion (optional)
  if (ext === '.gif' || mimetype === 'image/gif') {
    try {
      processingPath = await convertGifToMp4(tempPath);
      ext = '.mp4';
    } catch (err) {
      fs.unlinkSync(tempPath);
      throw new Error(`Failed to convert GIF to MP4: ${err.message}`);
    }
  }

  // 2) Only JPG/PNG images allowed
  const isImage = mimetype.startsWith('image/');
  if (isImage && !ALLOWED_IMAGE_EXTS.includes(ext)) {
    fs.unlinkSync(tempPath);
    if (processingPath !== tempPath) fs.unlinkSync(processingPath);
    throw new Error('Only JPG and PNG images are allowed.');
  }

  // 3) If it's a JPG/PNG, run through sharp to resize/compress
  if (isImage && ALLOWED_IMAGE_EXTS.includes(ext)) {
    const resizedPath = tempPath + '-resized' + ext;
    try {
      await sharp(processingPath)
        .resize({ width: 1000, height: 1000, fit: 'inside' })
        .toFormat(ext === '.png' ? 'png' : 'jpeg', {
          quality: 80,   // adjust quality as needed
          mozjpeg: true, // better JPEG compression
        })
        .toFile(resizedPath);

      // swap in our resized file
      if (processingPath !== tempPath) fs.unlinkSync(processingPath);
      processingPath = resizedPath;
    } catch (err) {
      // cleanup and fail if sharp errors
      fs.unlinkSync(tempPath);
      if (fs.existsSync(resizedPath)) fs.unlinkSync(resizedPath);
      throw new Error(`Image compression failed: ${err.message}`);
    }
  }

  // 4) Generate random filename & S3 key
  const randomName = crypto.randomBytes(16).toString('hex') + ext;
  const s3Key = `uploads/${randomName}`;

  // 5) Upload to S3
  const fileStream = fs.createReadStream(processingPath);
  await s3Client.send(new PutObjectCommand({
    Bucket: 'gameofmind',
    Key: s3Key,
    Body: fileStream,
    ContentType: ext === '.mp4' ? 'video/mp4' : mimetype,
    ACL: 'public-read',
  }));

  // 6) Cleanup all temp files
  fs.unlinkSync(tempPath);
  if (processingPath !== tempPath) fs.unlinkSync(processingPath);

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


