const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Get all debts
app.get('/api/debts', async (req, res) => {
    try {
        const debts = await prisma.debt.findMany();
        res.json(debts);
    } catch (err) {
        console.error('Error reading debts:', err);
        res.status(500).send('Server error');
    }
});

// Add a new debt
app.post('/api/debts', async (req, res) => {
    try {
        const { friendName, telegramUsername, exchangeDate, totalOwed, dueDate } = req.body;
        const newDebt = await prisma.debt.create({
            data: {
                friendName,
                telegramUsername,
                exchangeDate: new Date(exchangeDate),
                totalOwed,
                dueDate: new Date(dueDate),
                partialPayments: []
            }
        });
        res.status(201).json({ id: newDebt.id });
    } catch (err) {
        console.error('Error adding debt:', err);
        res.status(500).send('Server error');
    }
});

// Update partial payments for a debt
app.post('/api/debts/:id/payments', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const debt = await prisma.debt.findUnique({ where: { id: parseInt(id, 10) } });
        if (!debt) {
            return res.status(404).send('Debt not found');
        }
        const partialPayments = debt.partialPayments.concat(amount);
        const remainingOwed = debt.totalOwed - partialPayments.reduce((acc, payment) => acc + payment, 0);
        await prisma.debt.update({
            where: { id: parseInt(id, 10) },
            data: { partialPayments }
        });
        res.json({ remainingOwed });
    } catch (err) {
        console.error('Error updating payments:', err);
        res.status(500).send('Server error');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

module.exports = app;
