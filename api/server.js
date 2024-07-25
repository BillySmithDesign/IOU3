const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

let debts = require('../debts.json');

app.get('/api/debts', (req, res) => {
    res.json(debts);
});

app.post('/api/debts', (req, res) => {
    const newDebt = req.body;
    debts.push(newDebt);
    fs.writeFileSync(path.join(__dirname, '../debts.json'), JSON.stringify(debts));
    res.status(201).send();
});

module.exports = app;
