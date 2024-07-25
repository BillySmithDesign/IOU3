document.getElementById('debtForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let friendName = document.getElementById('friendName').value;
    let telegramUsername = document.getElementById('telegramUsername').value;
    let exchangeDate = document.getElementById('exchangeDate').value;
    let totalOwed = document.getElementById('totalOwed').value;
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
    document.getElementById('debtForm').reset();
});

function addDebt(debt) {
    let debtList = document.getElementById('debtList');
    let li = document.createElement('li');

    li.innerHTML = `
        <span>
            <strong>${debt.friendName}</strong> (@${debt.telegramUsername})<br>
            Date: ${debt.exchangeDate}<br>
            Total Owed: $${debt.totalOwed}<br>
            Due Date: ${debt.dueDate}
        </span>
        <button onclick="addPartialPayment(this, ${debt.totalOwed})">Add Payment</button>
    `;

    debtList.appendChild(li);
}

function addPartialPayment(button, totalOwed) {
    let amount = prompt("Enter payment amount:");
    if (amount) {
        totalOwed -= amount;
        button.parentNode.querySelector('span').innerHTML += `<br>Payment: $${amount} (Remaining: $${totalOwed})`;
    }
}
