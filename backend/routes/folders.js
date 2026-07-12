const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const requireAuth = require('../middleware/auth');
const { deleteObject } = require('../s3');

const router = express.Router();
router.use(requireAuth);

// Create a folder (parent_folder_id optional -> null means root)
router.post('/', (req, res) => {
  const { name, parent_folder_id = null } = req.body;
  if (!name) return res.status(400).json({ error: 'Folder name is required' });

  const id = uuidv4();
  db.createFolder({ id, name, parent_folder_id, owner_id: req.user.id, created_at: new Date().toISOString() });
  res.status(201).json({ id, name, parent_folder_id });
});

// List contents of a folder (or root if no id given)
router.get('/:id?', (req, res) => {
  const parentId = req.params.id || null;
  const folders = db.listFolders(req.user.id, parentId);
  const files = db.listFiles(req.user.id, parentId);
  res.json({ folders, files });
});

// Rename a folder
router.patch('/:id', (req, res) => {
  const { name } = req.body;
  const folder = db.findFolderById(req.params.id);
  if (!folder || folder.owner_id !== req.user.id) return res.status(404).json({ error: 'Folder not found' });

  db.updateFolder(req.params.id, { name });
  res.json({ success: true });
});

// Delete a folder (cascades to sub-folders/files)
router.delete('/:id', async (req, res) => {
  const folder = db.findFolderById(req.params.id);
  if (!folder || folder.owner_id !== req.user.id) return res.status(404).json({ error: 'Folder not found' });

  const deletedFiles = db.deleteFolderCascade(req.params.id);
  for (const file of deletedFiles) {
    try { await deleteObject(file.s3_key); } catch (e) { console.error('S3 cleanup failed:', e.message); }
  }
  res.json({ success: true });
});

module.exports = router;
