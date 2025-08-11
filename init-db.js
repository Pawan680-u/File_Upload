const Database = require('better-sqlite3');

// This will create ./db/mydatabase.db if it doesn't exist
const db = new Database('./db/mydatabase.db');

// Create the table
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("Database created with 'files' table");
