const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// app.use(express.static(/frontend/public));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',       // Change if your MySQL has a password
  database: 'pension_management'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Routes

// Get all videos
app.get('/api/videos', (req, res) => {
  db.query('SELECT * FROM videos', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add a new video
app.post('/api/videos', (req, res) => {
  const { video_link, video_name, video_description, photo_files, doc_files } = req.body;
  const sql = 'INSERT INTO videos (video_link, video_name, video_description, photo_files, doc_files) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [video_link, video_name, video_description, photo_files, doc_files], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Video added successfully', id: result.insertId });
  });
});

// View single video by ID
app.get('/api/videos/:id', (req, res) => {
  db.query('SELECT * FROM videos WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

// Update video
app.put('/api/videos/:id', (req, res) => {
  const { video_link, video_name, video_description, photo_files, doc_files } = req.body;
  const sql = 'UPDATE videos SET video_link=?, video_name=?, video_description=?, photo_files=?, doc_files=? WHERE id=?';
  db.query(sql, [video_link, video_name, video_description, photo_files, doc_files, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Video updated successfully' });
  });
});

// Delete video
app.delete('/api/videos/:id', (req, res) => {
  db.query('DELETE listenFROM videos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Video deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
