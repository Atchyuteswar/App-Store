const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../lib/supabase');

// Temp directory for multer (files get uploaded to Supabase Storage then deleted)
const tmpDir = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const slugBase = (req.body.name || 'app')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const ext = path.extname(file.originalname);
    cb(null, `${slugBase}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'icon' || file.fieldname === 'screenshots') {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
  } else if (file.fieldname === 'appFile') {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.apk', '.ipa'].includes(ext)) cb(null, true);
    else cb(new Error('Only APK and IPA files are allowed'), false);
  } else {
    cb(null, true);
  }
};

const MAX_APK_SIZE = (parseInt(process.env.MAX_APK_SIZE_MB) || 500) * 1024 * 1024;

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_APK_SIZE } });

const uploadFields = upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'screenshots', maxCount: 8 },
  { name: 'appFile', maxCount: 1 },
]);

// Upload a file to Supabase Storage and return the public URL
async function uploadToStorage(file, folder) {
  const filePath = `${folder}/${file.filename}`;
  const fileBuffer = fs.readFileSync(file.path);

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, fileBuffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  // Clean up temp file
  fs.unlinkSync(file.path);

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
  return data.publicUrl;
}

// Delete a file from Supabase Storage by its public URL
async function deleteFromStorage(publicUrl) {
  if (!publicUrl || !publicUrl.includes('/storage/v1/object/public/uploads/')) return;
  const filePath = publicUrl.split('/storage/v1/object/public/uploads/')[1];
  if (filePath) {
    await supabase.storage.from('uploads').remove([filePath]);
  }
}

module.exports = { uploadFields, uploadToStorage, deleteFromStorage };
