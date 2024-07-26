const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Create table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS debts (
    id SERIAL PRIMARY KEY,
    friendName VARCHAR(100) NOT NULL,
    telegramUsername VARCHAR(100) NOT NULL,
    exchangeDate DATE NOT NULL,
    totalOwed DECIMAL(10, 2) NOT NULL,
    dueDate DATE NOT NULL,
    partialPayments JSONB
  )
`).catch(err => console.error('Error creating table:', err));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Get all debts
app.get('/api/debts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM debts');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Add a new debt
app.post('/api/debts', async (req, res) => {
    const { friendName, telegramUsername, exchangeDate, totalOwed, dueDate, partialPayments } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO debts (friendName, telegramUsername, exchangeDate, totalOwed, dueDate, partialPayments) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [friendName, telegramUsername, exchangeDate, totalOwed, dueDate, JSON.stringify(partialPayments || [])]
        );
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update partial payments for a debt
app.post('/api/debts/:id/payments', async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    try {
        const debtResult = await pool.query('SELECT * FROM debts WHERE id = $1', [id]);
        const debt = debtResult.rows[0];
        if (!debt) {
            return res.status(404).send('Debt not found');
        }
        const partialPayments = JSON.parse(debt.partialPayments || '[]');
        partialPayments.push(amount);
        const remainingOwed = debt.totalOwed - partialPayments.reduce((acc, payment) => acc + payment, 0);
        await pool.query(
            'UPDATE debts SET partialPayments = $1 WHERE id = $2',
            [JSON.stringify(partialPayments), id]
        );
        res.json({ remainingOwed });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = app;
