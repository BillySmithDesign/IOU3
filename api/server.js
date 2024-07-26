const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('debts.db');

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    friendName TEXT NOT NULL,
    telegramUsername TEXT NOT NULL,
    exchangeDate TEXT NOT NULL,
    totalOwed REAL NOT NULL,
    dueDate TEXT NOT NULL,
    partialPayments TEXT
  )
`);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Get all debts
app.get('/api/debts', (req, res) => {
    const stmt = db.prepare('SELECT * FROM debts');
    const debts = stmt.all();
    res.json(debts);
});

// Add a new debt
app.post('/api/debts', (req, res) => {
    const { friendName, telegramUsername, exchangeDate, totalOwed, dueDate, partialPayments } = req.body;
    const stmt = db.prepare('INSERT INTO debts (friendName, telegramUsername, exchangeDate, totalOwed, dueDate, partialPayments) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(friendName, telegramUsername, exchangeDate, totalOwed, dueDate, JSON.stringify(partialPayments || []));
    res.status(201).send();
});

// Update partial payments for a debt
app.post('/api/debts/:id/payments', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const debtStmt = db.prepare('SELECT * FROM debts WHERE id = ?');
    const debt = debtStmt.get(id);
    if (!debt) {
        return res.status(404).send('Debt not found');
    }
    const partialPayments = JSON.parse(debt.partialPayments || '[]');
    partialPayments.push(amount);
    const remainingOwed = debt.totalOwed - partialPayments.reduce((acc, payment) => acc + payment, 0);
    const updateStmt = db.prepare('UPDATE debts SET partialPayments = ? WHERE id = ?');
    updateStmt.run(JSON.stringify(partialPayments), id);
    res.json({ remainingOwed });
});

module.exports = app;
