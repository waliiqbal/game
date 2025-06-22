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
// import sharp from 'sharp';
// import crypto from 'crypto';
// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import s3Client from './s3Client.js';
//  import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
//  import ffprobeInstaller from '@ffprobe-installer/ffprobe';
//  import ffmpeg from 'fluent-ffmpeg';

// // Set paths for ffmpeg and ffprobe binaries
//  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
//  ffmpeg.setFfprobePath(ffprobeInstaller.path);

// // Multer setup for temporary uploads
// const upload = multer({ dest: 'uploads/' });
// const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png'];
// // Convert GIF to MP4 using fluent-ffmpeg
// const convertGifToMp4 = (inputPath) => {
//   return new Promise((resolve, reject) => {
//     const outputPath = `${inputPath}.mp4`;
//     ffmpeg(inputPath)
//       .outputOptions([
//         '-movflags faststart',               // for progressive streaming
//         '-pix_fmt yuv420p',                  // ensure compatibility
//         '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2' // even dimensions
//       ])
//       .toFormat('mp4')
//       .save(outputPath)
//       .on('end', () => resolve(outputPath))
//       .on('error', (err) => reject(err));
//   });
// };

// // Upload (and convert if needed) to S3
// const uploadToS3 = async (file) => {
//   const { path: tempPath, mimetype, originalname } = file;
//   let ext = path.extname(originalname).toLowerCase();
//   let processingPath = tempPath;
//   let finalContentType = mimetype;

//   // 1) GIF → MP4 conversion (optional)
//   if (ext === '.gif' || mimetype === 'image/gif') {
//     try {
//       return;
//       processingPath = await convertGifToMp4(tempPath);
//       ext = '.mp4';
//       finalContentType = 'video/mp4';
//     } catch (err) {
//       fs.unlinkSync(tempPath);
//       throw new Error(`Failed to convert GIF to MP4: ${err.message}`);
//     }
//   }

//    // 3) If it's a JPG/PNG, run through sharp to resize/compress
//    else if (mimetype.startsWith('image/')) {
//     const resizedPath = tempPath + '-resized' + ext;
//     try {
//       await sharp(processingPath)
//         .resize({ width: 1000, height: 1000, fit: 'inside' })
//         .jpeg({ quality: 80, mozjpeg: true })
//         .toFile(resizedPath);

//       // delete old file if needed
//       if (processingPath !== tempPath) fs.unlinkSync(processingPath);
//       processingPath = resizedPath;
//       ext = '.jpg';                  // enforce JPEG extension
//       finalContentType = 'image/jpeg';                 // enforce JPEG extension
//     } catch (err) {
//       fs.unlinkSync(tempPath);
//       if (fs.existsSync(resizedPath)) fs.unlinkSync(resizedPath);
//       throw new Error(`Image processing failed: ${err.message}`);
//     }
//   }
  

//   // 4) Generate random filename & S3 key
//   const randomName = crypto.randomBytes(16).toString('hex') + ext;
//   const s3Key = `uploads/${randomName}`;

//   // 5) Upload to S3
//   const fileStream = fs.createReadStream(processingPath);
//   await s3Client.send(new PutObjectCommand({
//     Bucket: 'gameofmind',
//     Key: s3Key,
//     Body: fileStream,
//     ContentType: finalContentType, 
//     //ext === '.mp4' ? 'video/mp4' : mimetype,
//     ACL: 'public-read',
//   }));

//   // explicitly close the stream so unlinkSync won’t fail
//    await new Promise((resolve, reject) => {
//     fileStream.on('close', resolve);
//     fileStream.on('error', reject);
//     // In case destroy doesn’t immediately close, explicitly call it
//     fileStream.destroy();
//   });

//   // 6) Cleanup temp files
//   fs.unlinkSync(tempPath);
//   if (processingPath !== tempPath) fs.unlinkSync(processingPath);

//   return `https://gameofmind.s3.ap-south-1.amazonaws.com/${s3Key}`;
// };

// export { upload, uploadToS3 };

























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


