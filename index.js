const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('transactions.db');
const app = express();
const port = process.env.PORT || 5500;


app.use(express.json());
app.use(cors());
db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL
      )
    `);
  });
  

app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { date, description, type, amount } = req.body;
  const stmt = db.prepare('INSERT INTO transactions (date, description, type, amount) VALUES (?, ?, ?, ?)');
  stmt.run(date, description, type, amount, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, date, description, type, amount });
  });
  stmt.finalize();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
