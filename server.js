const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const os = require("os"); // OS module

// Ensure folders exist
["db", "uploads", "public"].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`Created folder: ${dir}`);
  }
});

// Setup
const app = express();
const PORT = 3000;
const db = new Database("db/database.db");

// Get OS information
const osInfo = {
  type: os.type(),
  version: os.version(),
  platform: os.platform(),
  release: os.release(),
  architecture: os.arch()
};

console.log("Server OS Information:", osInfo);

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());

// Create DB table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    originalname TEXT NOT NULL,
    upload_time TEXT NOT NULL,
    os_info TEXT
  );
`).run();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  const { filename, originalname } = req.file;
  const upload_time = new Date().toISOString();
  const osData = JSON.stringify(osInfo);
  
  db.prepare("INSERT INTO files (filename, originalname, upload_time, os_info) VALUES (?, ?, ?, ?)")
    .run(filename, originalname, upload_time, osData);

  res.json({ 
    success: true,
    message: "File uploaded successfully",
    osInfo: osInfo
  });
});

// Get files route
app.get("/files", (req, res) => {
  const files = db.prepare("SELECT * FROM files ORDER BY upload_time DESC").all();
  const filesWithOS = files.map(file => ({
    ...file,
    os_info: file.os_info ? JSON.parse(file.os_info) : null
  }));
  res.json(filesWithOS);
});

// Get OS info route
app.get("/os-info", (req, res) => {
  res.json(osInfo);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Database connected at db/database.db");
});
