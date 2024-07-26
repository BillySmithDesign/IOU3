document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/debts')
    .then(response => response.json())
    .then(debts => {
        const tbody = document.querySelector('#overdueDebtsTable tbody');
        const today = new Date();

        debts.forEach(debt => {
            const dueDate = new Date(debt.dueDate);
            if (dueDate < today && calculateDaysOverdue(dueDate) > 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${debt.friendName}</td>
                    <td>$${debt.totalOwed.toFixed(2)}</td>
                    <td>${calculateDaysOverdue(dueDate)} days</td>
                    <td><a href="https://t.me/${debt.telegramUsername}" target="_blank">@${debt.telegramUsername}</a></td>
                `;
                tbody.appendChild(tr);
            }
        });
    }).catch(err => console.error('Fetch error:', err));
});

function calculateDaysOverdue(dueDate) {
    const today = new Date();
    const timeDiff = today - dueDate;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
}
