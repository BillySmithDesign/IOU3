document.getElementById('debtForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let friendName = document.getElementById('friendName').value;
    let telegramUsername = document.getElementById('telegramUsername').value;
    let exchangeDate = document.getElementById('exchangeDate').value;
    let totalOwed = parseFloat(document.getElementById('totalOwed').value);
    let dueDate = document.getElementById('dueDate').value;

    if (isNaN(totalOwed)) {
        alert("Please enter a valid amount for Total Owed.");
        return;
    }

    let debt = {
        friendName,
        telegramUsername,
        exchangeDate,
        totalOwed,
        dueDate,
        partialPayments: []
    };

    fetch('/api/debts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(debt)
    }).then(response => {
        if (response.ok) {
            response.json().then(data => {
                addDebtToUI(debt, data.id);
                updateTotalBalance();
                document.getElementById('debtForm').reset();
            });
        } else {
            console.error('Error adding debt:', response.statusText);
        }
    });
});

function addDebtToUI(debt, id) {
    let debtList = document.getElementById('debtList');
    let li = document.createElement('li');

    li.innerHTML = `
        <span>
            <strong>${debt.friendName}</strong> (@${debt.telegramUsername})<br>
            Date Collected: ${debt.exchangeDate}<br>
            Total Owed: $${debt.totalOwed.toFixed(2)}<br>
            Due Date: ${debt.dueDate}
        </span>
        <button onclick="addPartialPayment(${id}, this, ${debt.totalOwed})">Add Payment</button>
    `;

    debtList.appendChild(li);
}

function addPartialPayment(id, button, totalOwed) {
    let amount = parseFloat(prompt("Enter payment amount:"));
    if (!isNaN(amount)) {
        fetch(`/api/debts/${id}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount })
        })
        .then(response => response.json())
        .then(data => {
            button.parentNode.querySelector('span').innerHTML += `<br>Payment: $${amount.toFixed(2)} (Remaining: $${data.remainingOwed.toFixed(2)})`;
            updateTotalBalance();
        });
    } else {
        alert("Please enter a valid payment amount.");
    }
}

function updateTotalBalance() {
    fetch('/api/debts')
    .then(response => response.json())
    .then(debts => {
        let totalBalance = 0;
        debts.forEach(debt => {
            let partialPayments = JSON.parse(debt.partialPayments || '[]');
            let totalOwed = parseFloat(debt.totalOwed) || 0;
            let paidAmount = partialPayments.reduce((acc, payment) => acc + parseFloat(payment) || 0, 0);
            let remainingOwed = totalOwed - paidAmount;
            totalBalance += remainingOwed;
        });
        document.getElementById('totalBalance').innerText = totalBalance.toFixed(2);
    });
}

// Initial fetch and display of debts
fetch('/api/debts')
.then(response => response.json())
.then(debts => {
    debts.forEach(debt => {
        addDebtToUI(debt, debt.id);
    });
    updateTotalBalance();
});
