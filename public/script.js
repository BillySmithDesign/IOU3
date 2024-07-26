document.getElementById('debtForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let friendName = document.getElementById('friendName').value;
    let telegramUsername = document.getElementById('telegramUsername').value;
    let exchangeDate = document.getElementById('exchangeDate').value;
    let totalOwed = parseFloat(document.getElementById('totalOwed').value);
    let dueDate = document.getElementById('dueDate').value;

    let debt = {
        friendName,
        telegramUsername,
        exchangeDate,
        totalOwed,
        dueDate,
        partialPayments: []
    };

    addDebt(debt);
    updateTotalBalance();
    document.getElementById('debtForm').reset();
});

function addDebt(debt) {
    let debtList = document.getElementById('debtList');
    let li = document.createElement('li');

    li.innerHTML = `
        <span>
            <strong>${debt.friendName}</strong> @${debt.telegramUsername}<br>
            Date Collected: ${debt.exchangeDate}<br>
            Total Owed: $${debt.totalOwed.toFixed(2)}<br>
            Due Date: ${debt.dueDate}
        </span>
        <button onclick="addPartialPayment(this, ${debt.totalOwed})">Add Payment</button>
    `;

    debtList.appendChild(li);
}

function addPartialPayment(button, totalOwed) {
    let amount = parseFloat(prompt("Enter payment amount:"));
    if (!isNaN(amount)) {
        totalOwed -= amount;
        button.parentNode.querySelector('span').innerHTML += `<br>Payment: $${amount.toFixed(2)} (Remaining: $${totalOwed.toFixed(2)})`;
        updateTotalBalance();
    }
}

function updateTotalBalance() {
    let totalBalance = 0;
    let debts = document.querySelectorAll('#debtList li span');
    debts.forEach(debt => {
        let totalText = debt.innerHTML.match(/Total Owed: \$(\d+\.\d+)/);
        let remainingText = debt.innerHTML.match(/Remaining: \$(\d+\.\d+)/);
        if (remainingText) {
            totalBalance += parseFloat(remainingText[1]);
        } else if (totalText) {
            totalBalance += parseFloat(totalText[1]);
        }
    });
    document.getElementById('totalBalance').innerText = totalBalance.toFixed(2);
}

