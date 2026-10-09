const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Cloudflare R2 Configuration (S3-Compatible API)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'careerline-resumes';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g. https://pub-xxxx.r2.dev or custom domain

const isR2Configured = Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);

let s3Client = null;
if (isR2Configured) {
  try {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
      }
    });
    console.log(`[STORAGE] Cloudflare R2 configured. Bucket: "${R2_BUCKET_NAME}"`);
  } catch (err) {
    console.error('[STORAGE] Error initializing Cloudflare R2 client:', err.message);
  }
} else {
  console.log('[STORAGE] Cloudflare R2 credentials not set. Falling back to local disk storage (/uploads/resumes/).');
}

/**
 * Upload a candidate resume file from local disk to Cloudflare R2 bucket
 * @param {string} localFilePath - Path to temporary file on disk
 * @param {string} filename - Stored unique filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string|null>} - Returns public URL on success, or null if R2 not configured
 */
async function uploadResumeToR2(localFilePath, filename, mimeType) {
  if (!isR2Configured || !s3Client) {
    return null;
  }

  const fileBuffer = fs.readFileSync(localFilePath);
  const key = `resumes/${filename}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType || 'application/pdf'
  }));

  // Delete temporary file from local disk once uploaded to R2
  try {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  } catch (e) {
    console.warn('[STORAGE] Temporary file cleanup warning:', e.message);
  }

  // Construct viewable link
  if (R2_PUBLIC_URL) {
    const cleanBase = R2_PUBLIC_URL.replace(/\/$/, '');
    return `${cleanBase}/${key}`;
  }

  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

module.exports = {
  isR2Configured,
  uploadResumeToR2
};
