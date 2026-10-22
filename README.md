# CloudBox - Cloud File Storage System

A cloud-based file storage application that allows users to securely upload, organize, download, and share files. It uses **AWS S3 pre-signed URLs** so files are uploaded and downloaded directly between the browser and Amazon S3, while the backend manages authentication and file metadata.

---

## **Live Demo**

**Frontend:** https://clinquant-cat-e4b016.netlify.app

**Backend API:** https://cloud-storage-yk5i.onrender.com

---

## **Features**

- User Registration & Login (JWT Authentication)
- Create, Rename, and Delete Folders
- Upload Files Directly to AWS S3
- Download Files from AWS S3
- Generate Public Share Links
- Organize Files in Nested Folders
- Delete Files and Folders
- Secure Cloud Storage with AWS S3 Pre-Signed URLs

---

## **Tech Stack**

### **Frontend**
- HTML
- CSS
- JavaScript

### **Backend**
- Node.js
- Express.js
- JWT Authentication

### **Database**
- SQLite (`better-sqlite3`)

### **Cloud Services**
- AWS S3
- AWS IAM
- Pre-Signed URLs

### **Deployment**
- Netlify
- Render

---

## **System Architecture**

```text
Browser
    │
    ▼
Frontend (HTML/CSS/JS)
    │
    ▼
Express REST API
    │
    ├── SQLite (Metadata)
    │
    └── AWS S3 (File Storage)
           ▲
           │
Direct Upload & Download
using Pre-Signed URLs
```

---

## **Project Structure**

```text
cloud-storage/
│
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── s3.js
│   └── server.js
│
└── frontend/
    ├── index.html
    ├── share.html
    ├── config.js
    ├── css/
    └── js/
```

---

## **Installation**

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/cloud-storage.git
cd cloud-storage
```

### **2. Install Dependencies**

```bash
cd backend
npm install
```

### **3. Configure Environment Variables**

Create a `.env` file inside the `backend` folder.

```env
JWT_SECRET=your_secret
AWS_REGION=your_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

### **4. Start the Backend**

```bash
npm start
```

Backend runs on:

```text
http://localhost:4000
```

### **5. Run the Frontend**

Open `frontend/index.html` in your browser or serve the frontend using any static server.

---

## **API Modules**

- Authentication
- Folder Management
- File Upload
- File Download
- File Sharing
- File & Folder Deletion

---

## **Security**

- JWT-based Authentication
- Password Hashing
- Secure AWS S3 Pre-Signed URLs
- Backend stores only file metadata
- Direct browser-to-S3 file transfers

---

## **Future Improvements**

- Share Link Expiration
- File Versioning
- Drag-and-Drop Uploads
- File Search
- Recent Files Dashboard
- Recycle Bin
- File Preview Support

---

## **Key Learning Outcomes**

- REST API Development
- JWT Authentication
- AWS S3 Integration
- Pre-Signed URL Generation
- SQLite Database Design
- Cloud Storage Architecture
- Full-Stack Web Development
- Secure File Upload & Download

---
