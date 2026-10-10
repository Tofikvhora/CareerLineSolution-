require('dotenv').config();
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
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
    console.log(`✅ [STORAGE] Cloudflare R2 S3 Client connected. Bucket: "${R2_BUCKET_NAME}"`);
    if (R2_PUBLIC_URL) {
      console.log(`✅ [STORAGE] Cloudflare R2 Public Domain: ${R2_PUBLIC_URL}`);
    } else {
      console.warn('⚠️ [STORAGE] R2_PUBLIC_URL not set! Resumes will upload to R2, but public browser links need R2_PUBLIC_URL (e.g. https://pub-xxxx.r2.dev).');
    }
  } catch (err) {
    console.error('❌ [STORAGE] Error initializing Cloudflare R2 client:', err.message);
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
    let cleanBase = R2_PUBLIC_URL.trim().replace(/\/$/, '');
    if (!cleanBase.startsWith('http://') && !cleanBase.startsWith('https://')) {
      cleanBase = `https://${cleanBase}`;
    }
    return `${cleanBase}/${key}`;
  }

  // Fallback direct endpoint
  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Delete a resume from Cloudflare R2 bucket to free up storage space
 * @param {string} resumeUrl - Public URL or key
 */
async function deleteResumeFromR2(resumeUrl) {
  if (!isR2Configured || !s3Client || !resumeUrl) {
    return;
  }

  try {
    let key = '';
    if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
      const urlObj = new URL(resumeUrl);
      key = urlObj.pathname.replace(/^\//, '');
    } else {
      key = resumeUrl.replace(/^\//, '');
    }

    if (key) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key
      }));
      console.log(`[STORAGE] Deleted resume from Cloudflare R2: ${key}`);
    }
  } catch (err) {
    console.warn('[STORAGE] Failed to delete file from Cloudflare R2:', err.message);
  }
}

module.exports = {
  isR2Configured,
  uploadResumeToR2,
  deleteResumeFromR2
};
