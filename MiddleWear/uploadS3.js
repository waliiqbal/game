// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import s3Client from './s3Client.js';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// import ffprobeInstaller from '@ffprobe-installer/ffprobe';
// import ffmpeg from 'fluent-ffmpeg';

// // Set paths for ffmpeg and ffprobe binaries
// ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// ffmpeg.setFfprobePath(ffprobeInstaller.path);

// // Multer setup for temporary uploads
// const upload = multer({ dest: 'uploads/' });

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
//   let filePath = file.path;
//   let originalName = path.parse(file.originalname).name;
//   let ext = path.extname(file.originalname).toLowerCase();

//   // If the uploaded file is a GIF, convert it first
//   if (ext === '.gif' || file.mimetype === 'image/gif') {
//     try {
//       filePath = await convertGifToMp4(file.path);
//       ext = '.mp4';
//       originalName += '-converted';
//     } catch (err) {
//       fs.unlinkSync(file.path);
//       throw new Error(`Failed to convert GIF to MP4: ${err.message}`);
//     }
//   }

//   const fileStream = fs.createReadStream(filePath);
//   const filename = `${Date.now()}-${originalName}${ext}`;
//   const s3Key = `uploads/${filename}`;

//   const uploadParams = {
//     Bucket: 'gameofmind',
//     Key: s3Key,
//     Body: fileStream,
//     ContentType: ext === '.mp4' ? 'video/mp4' : file.mimetype,
//     ACL: 'public-read',
//   };

//   await s3Client.send(new PutObjectCommand(uploadParams));

//   // Clean up temporary files
//   fs.unlinkSync(file.path);
//   if (filePath !== file.path) fs.unlinkSync(filePath);

//   return `https://gameofmind.s3.ap-south-1.amazonaws.com/${s3Key}`;
// };

// export { upload, uploadToS3 };



import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from './s3Client.js';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';

// Set paths for ffmpeg and ffprobe binaries
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Updated cleanupFiles function
const cleanupFiles = async (...filePaths) => {
    console.log('--- Starting cleanupFiles ---');
    for (const filePath of filePaths) {
        if (filePath && fs.existsSync(filePath)) {
            let attempts = 0;
            const maxAttempts = 15;  // Increased attempts
            const delayMs = 500;     // Increased delay

            while (attempts < maxAttempts) {
                try {
                    console.log(`Attempting to delete: ${filePath} (Attempt ${attempts + 1}/${maxAttempts})`);
                    await fs.promises.unlink(filePath);
                    console.log(`Cleaned up temporary file: ${filePath}`);
                    break;
                } catch (err) {
                    if (err.code === 'EPERM' || err.code === 'EBUSY') {
                        if (attempts < maxAttempts - 1) {
                            console.warn(`${err.code} error for ${filePath}. Retrying in ${delayMs}ms...`);
                            await new Promise(resolve => setTimeout(resolve, delayMs));
                            attempts++;
                        } else {
                            console.error(`Failed to clean up file ${filePath} after ${attempts + 1} attempts due to ${err.code}: ${err.message}`);
                            break;
                        }
                    } else {
                        console.error(`Failed to clean up file ${filePath} after ${attempts + 1} attempts: ${err.message} (Code: ${err.code})`);
                        break;
                    }
                }
            }
        } else {
            console.log(`File does not exist or path is null, skipping cleanup for: ${filePath}`);
        }
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Final delay before cleanup ends
    console.log('--- cleanupFiles finished ---');
};

// Convert GIF to MP4
const convertGifToMp4 = (inputPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = `${inputPath}.mp4`;
        console.log(`Starting GIF conversion: ${inputPath} to ${outputPath}`);
        ffmpeg(inputPath)
            .outputOptions([
                '-movflags faststart',
                '-pix_fmt yuv420p',
                '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2'
            ])
            .toFormat('mp4')
            .save(outputPath)
            .on('end', () => {
                console.log(`GIF conversion successful: ${outputPath}`);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error(`GIF conversion failed for ${inputPath}: ${err.message}`);
                reject(err);
            });
    });
};

// Main upload function
const uploadToS3 = async (file) => {
    console.log(`--- Starting uploadToS3 for file: ${file.originalname} ---`);
    const { path: tempPath, mimetype, originalname } = file;
    let ext = path.extname(originalname).toLowerCase();
    let fileToUploadPath = tempPath;
    let finalContentType = mimetype;
    let fileStream = null;
    const pathsToClean = new Set([tempPath]);

    try {
        if (ext === '.gif' || mimetype === 'image/gif') {
            console.log('Detected GIF. Initiating conversion to MP4.');
            const convertedPath = await convertGifToMp4(tempPath);
            fileToUploadPath = convertedPath;
            ext = '.mp4';
            finalContentType = 'video/mp4';
            pathsToClean.add(convertedPath);
        } else if (mimetype.startsWith('image/')) {
            console.log('Detected non-GIF image. Processing with Sharp.');
            const resizedPath = tempPath + '-resized.jpeg';
            try {
                await sharp(tempPath)
                    .resize({ width: 1000, height: 1000, fit: 'inside' })
                    .jpeg({ quality: 80, mozjpeg: true })
                    .toFile(resizedPath);
                fileToUploadPath = resizedPath;
                ext = '.jpeg';
                finalContentType = 'image/jpeg';
                pathsToClean.add(resizedPath);
            } catch (err) {
                console.error(`Sharp processing failed: ${err.message}`);
                throw new Error(`Image processing failed: ${err.message}`);
            }
        } else {
            console.warn(`Unsupported file type. Uploading original: ${tempPath}`);
        }

        const randomName = crypto.randomBytes(16).toString('hex') + ext;
        const s3Key = `uploads/${randomName}`;
        console.log(`Generated S3 Key: ${s3Key}`);
        fileStream = fs.createReadStream(fileToUploadPath);

        await new Promise((resolve, reject) => {
            const uploadCommand = new PutObjectCommand({
                Bucket: 'gameofmind',
                Key: s3Key,
                Body: fileStream,
                ContentType: finalContentType,
                ACL: 'public-read',
            });

            s3Client.send(uploadCommand)
                .then(data => {
                    console.log("S3 Upload Success:", data);
                    resolve(data);
                })
                .catch(err => {
                    console.error("S3 Upload Error:", err);
                    reject(err);
                });
        });

        const s3Url = `https://gameofmind.s3.ap-south-1.amazonaws.com/${s3Key}`;
        console.log(`S3 upload complete. URL: ${s3Url}`);
        return s3Url;

    } catch (error) {
        console.error('Error during upload:', error);
        throw error;
    } finally {
        if (fileStream) {
            console.log('Destroying file stream...');
            fileStream.destroy();
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay after destroy
            fileStream = null;
        }

        console.log('--- Delay before cleanup ---');
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay before cleanup
        console.log('--- Starting final cleanup ---');
        await cleanupFiles(...Array.from(pathsToClean));
        console.log('--- uploadToS3 finished ---');
    }
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


