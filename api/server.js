const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const dataFilePath = path.join(__dirname, '../debts.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Read debts from file
function readDebts() {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
}

// Write debts to file
function writeDebts(debts) {
    fs.writeFileSync(dataFilePath, JSON.stringify(debts, null, 2));
}

// Get all debts
app.get('/api/debts', (req, res) => {
    try {
        const debts = readDebts();
        res.json(debts);
    } catch (err) {
        console.error('Error reading debts:', err);
        res.status(500).send('Server error');
    }
});

// Add a new debt
app.post('/api/debts', (req, res) => {
    try {
        const debts = readDebts();
        const newDebt = req.body;
        newDebt.id = debts.length ? debts[debts.length - 1].id + 1 : 1;
        debts.push(newDebt);
        writeDebts(debts);
        res.status(201).json({ id: newDebt.id });
    } catch (err) {
        console.error('Error adding debt:', err);
        res.status(500).send('Server error');
    }
});

// Update partial payments for a debt
app.post('/api/debts/:id/payments', (req, res) => {
    try {
        const debts = readDebts();
        const id = parseInt(req.params.id, 10);
        const { amount } = req.body;
        const debt = debts.find(d => d.id === id);
        if (!debt) {
            return res.status(404).send('Debt not found');
        }
        const partialPayments = debt.partialPayments || [];
        partialPayments.push(amount);
        debt.partialPayments = partialPayments;
        const remainingOwed = debt.totalOwed - partialPayments.reduce((acc, payment) => acc + payment, 0);
        writeDebts(debts);
        res.json({ remainingOwed });
    } catch (err) {
        console.error('Error updating payments:', err);
        res.status(500).send('Server error');
    }
});

module.exports = app;
