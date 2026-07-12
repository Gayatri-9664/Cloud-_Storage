const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const { getUploadUrl, getDownloadUrl, deleteObject } = require('../s3');

const router = express.Router();
router.use(requireAuth);

// Step 1: client asks for a pre-signed URL to upload directly to S3
router.post('/upload-url', async (req, res) => {
  const { filename, contentType, size, folder_id = null } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename is required' });

  const id = uuidv4();
  const s3_key = `${req.user.id}/${id}-${filename}`;

  try {
    const uploadUrl = await getUploadUrl(s3_key, contentType);

    db.createFile({
      id, filename, s3_key, size: size || 0, mime_type: contentType || null,
      folder_id, owner_id: req.user.id, created_at: new Date().toISOString(),
    });

    res.json({ fileId: id, uploadUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate upload URL. Check your AWS credentials in .env' });
  }
});

// Step 2: client requests a pre-signed URL to download the file directly from S3
router.get('/:id/download-url', async (req, res) => {
  const file = db.findFileById(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  if (file.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not have access to this file' });
  }

  try {
    const downloadUrl = await getDownloadUrl(file.s3_key, file.filename);
    res.json({ downloadUrl, filename: file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate download URL' });
  }
});

router.delete('/:id', async (req, res) => {
  const file = db.findFileById(req.params.id);
  if (!file || file.owner_id !== req.user.id) return res.status(404).json({ error: 'File not found' });

  try {
    await deleteObject(file.s3_key);
  } catch (err) {
    console.error('S3 delete failed (continuing to remove metadata):', err.message);
  }

  db.deleteFile(req.params.id);
  res.json({ success: true });
});

module.exports = router;
