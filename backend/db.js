// A tiny JSON-file-backed "database". No native compilation required —
// unlike better-sqlite3, this works instantly on any machine with just Node.js.
// Fine for a demo/project at this scale; swap for real Postgres/Mongo later if needed.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'storage.json');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return { users: [], folders: [], files: [], shares: [] };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ---- Users ----
function findUserByEmail(email) {
  return load().users.find(u => u.email === email) || null;
}
function findUserById(id) {
  return load().users.find(u => u.id === id) || null;
}
function createUser(user) {
  const data = load();
  data.users.push(user);
  save(data);
  return user;
}

// ---- Folders ----
function createFolder(folder) {
  const data = load();
  data.folders.push(folder);
  save(data);
  return folder;
}
function findFolderById(id) {
  return load().folders.find(f => f.id === id) || null;
}
function listFolders(ownerId, parentId) {
  return load().folders.filter(
    f => f.owner_id === ownerId && (f.parent_folder_id || null) === (parentId || null)
  );
}
function updateFolder(id, updates) {
  const data = load();
  const folder = data.folders.find(f => f.id === id);
  if (!folder) return null;
  Object.assign(folder, updates);
  save(data);
  return folder;
}
// Deletes a folder plus all nested sub-folders and the files inside them
function deleteFolderCascade(id) {
  const data = load();
  const toDelete = new Set([id]);
  let added = true;
  while (added) {
    added = false;
    for (const f of data.folders) {
      if (f.parent_folder_id && toDelete.has(f.parent_folder_id) && !toDelete.has(f.id)) {
        toDelete.add(f.id);
        added = true;
      }
    }
  }
  data.folders = data.folders.filter(f => !toDelete.has(f.id));
  const deletedFiles = data.files.filter(file => toDelete.has(file.folder_id));
  data.files = data.files.filter(file => !toDelete.has(file.folder_id));
  save(data);
  return deletedFiles; // caller deletes these from S3 too
}

// ---- Files ----
function createFile(file) {
  const data = load();
  data.files.push(file);
  save(data);
  return file;
}
function findFileById(id) {
  return load().files.find(f => f.id === id) || null;
}
function listFiles(ownerId, folderId) {
  return load().files.filter(
    f => f.owner_id === ownerId && (f.folder_id || null) === (folderId || null)
  );
}
function deleteFile(id) {
  const data = load();
  data.files = data.files.filter(f => f.id !== id);
  save(data);
}

// ---- Shares ----
function createShare(share) {
  const data = load();
  data.shares.push(share);
  save(data);
  return share;
}
function findShareByToken(token) {
  return load().shares.find(s => s.share_token === token) || null;
}

module.exports = {
  findUserByEmail, findUserById, createUser,
  createFolder, findFolderById, listFolders, updateFolder, deleteFolderCascade,
  createFile, findFileById, listFiles, deleteFile,
  createShare, findShareByToken,
};
