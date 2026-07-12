const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const { getDownloadUrl } = require('../s3');

const router = express.Router();

// Create a share link for a file (owner only)
router.post('/:fileId', requireAuth, (req, res) => {
  const { shared_with_email = null, permission = 'view' } = req.body;
  const file = db.findFileById(req.params.fileId);
  if (!file || file.owner_id !== req.user.id) return res.status(404).json({ error: 'File not found' });

  const id = uuidv4();
  const share_token = uuidv4();

  db.createShare({
    id, file_id: file.id, shared_with_email, share_token, permission,
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ shareToken: share_token, shareUrl: `/share/${share_token}` });
});

// Anyone with the token can resolve it to a download URL (no login required)
router.get('/:token', async (req, res) => {
  const share = db.findShareByToken(req.params.token);
  if (!share) return res.status(404).json({ error: 'Invalid or expired share link' });

  const file = db.findFileById(share.file_id);
  if (!file) return res.status(404).json({ error: 'File no longer exists' });

  try {
    const downloadUrl = await getDownloadUrl(file.s3_key, file.filename);
    res.json({ downloadUrl, filename: file.filename, permission: share.permission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate download URL' });
  }
});

module.exports = router;
