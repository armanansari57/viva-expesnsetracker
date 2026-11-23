// Get HTML elements

const form = document.getElementById("expenseForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactions = document.getElementById("transactions");
const filterInput = document.getElementById("filter");

// Category icons

const icons = {
    Food: "☕",
    Travel: "↗",
    Shopping: "◇",
    Bills: "▤",
    Study: "✎",
    Other: "＋"
};

// Today's date

const now = new Date();

function getLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const today = getLocalDate(now);

dateInput.value = today;

document.getElementById("today").textContent =
    now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

// Load expenses from LocalStorage

let expenses = [];

try {
    const savedExpenses = JSON.parse(
        localStorage.getItem("pocketExpenses")
    );

    expenses = Array.isArray(savedExpenses)
        ? savedExpenses
        : [];

} catch (error) {
    console.error("Error loading expenses:", error);
    expenses = [];
}

// Save expenses

function saveExpenses() {
    try {
        localStorage.setItem(
            "pocketExpenses",
            JSON.stringify(expenses)
        );
    } catch (error) {
        alert("Could not save expenses in this browser.");
        console.error(error);
    }
}

// Format currency

function formatMoney(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

// Format date

function formatDate(date) {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day)
        .toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
}

// Prevent HTML injection

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Render expenses

function renderExpenses() {

    // Calculate current month total

    const currentMonth = today.slice(0, 7);

    const monthlyTotal = expenses
        .filter(item =>
            item.date.slice(0, 7) === currentMonth
        )
        .reduce((sum, item) =>
            sum + Number(item.amount), 0
        );

    // Calculate all expenses

    const total = expenses.reduce(
        (sum, item) => sum + Number(item.amount),
        0
    );

    // Update summary cards

    document.getElementById("monthTotal").textContent =
        formatMoney(monthlyTotal);

    document.getElementById("allTotal").textContent =
        formatMoney(total);

    document.getElementById("entryCount").textContent =
        expenses.length;

    // Filter expenses by category

    const selectedCategory = filterInput.value;

    const filteredExpenses = expenses
        .filter(item =>
            selectedCategory === "All" ||
            item.category === selectedCategory
        )
        .sort((a, b) =>
            b.date.localeCompare(a.date) ||
            b.createdAt - a.createdAt
        );

    // Show empty message

    if (filteredExpenses.length === 0) {

        transactions.innerHTML = `
            <div class="empty">
                Nothing here yet.<br>
                Your expenses will appear here.
            </div>
        `;

        return;
    }

    // Display expense list

    transactions.innerHTML = filteredExpenses.map(item => `

        <div class="expense">

            <div class="expense-info">

                <div class="expense-icon">
                    ${icons[item.category] || "＋"}
                </div>

                <div class="expense-details">

                    <div class="expense-name">
                        ${escapeHTML(item.title)}
                    </div>

                    <div class="expense-category">
                        ${escapeHTML(item.category)}
                        · ${formatDate(item.date)}
                    </div>

                </div>

            </div>

            <div class="expense-right">

                <div class="expense-amount">
                    ${formatMoney(Number(item.amount))}
                </div>

                <button
                    type="button"
                    class="delete-btn"
                    data-id="${escapeHTML(item.id)}"
                    aria-label="Delete expense">
                    ×
                </button>

            </div>

        </div>

    `).join("");

}

// Add new expense

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    // Validate input

    if (!title || !Number.isFinite(amount) ||
        amount <= 0 || !date) {

        alert("Please enter valid expense details.");
        return;
    }

    // Create expense object

    const newExpense = {

        id: Date.now().toString() + Math.random(),

        title: title,
        amount: amount,
        category: category,
        date: date,

        createdAt: Date.now()

    };

    // Add expense to array

    expenses.push(newExpense);

    // Save and update list

    saveExpenses();

    renderExpenses();

    // Reset form

    form.reset();

    dateInput.value = today;

    titleInput.focus();

});

// Delete expense

transactions.addEventListener("click", function(event) {

    const button = event.target.closest(".delete-btn");

    if (!button) return;

    const id = button.dataset.id;

    expenses = expenses.filter(
        item => item.id !== id
    );

    saveExpenses();

    renderExpenses();

});

// Category filter

filterInput.addEventListener("change", function() {
    renderExpenses();
});

// Initial display

renderExpenses();