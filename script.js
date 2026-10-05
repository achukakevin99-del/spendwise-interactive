// ======================================
// SpendWise - Interactive Budget Tracker
// ======================================

// ---------- 1. DATA (variables and arrays) ----------
const CURRENCY = "KES";
let monthlyBudget = 0;   // number
let expenses = [];       // array of { id, name, amount, category }
let nextId = 1;          // gives every expense a unique id

// ---------- 2. DOM REFERENCES ----------
const budgetForm = document.getElementById("budget-form");
const budgetInput = document.getElementById("budget-input");
const budgetError = document.getElementById("budget-error");

const budgetDisplay = document.getElementById("budget-display");
const totalDisplay = document.getElementById("total-display");
const remainingDisplay = document.getElementById("remaining-display");
const progressBar = document.getElementById("progress-bar");
const percentDisplay = document.getElementById("percent-display");
const statusMessage = document.getElementById("status-message");

const expenseForm = document.getElementById("expense-form");
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseCategory = document.getElementById("expense-category");
const expenseError = document.getElementById("expense-error");

const filterCategory = document.getElementById("filter-category");
const expenseTable = document.getElementById("expense-table");
const expenseList = document.getElementById("expense-list");
const emptyMessage = document.getElementById("empty-message");
const resetBtn = document.getElementById("reset-btn");
const categoryList = document.getElementById("category-list");

// ---------- 3. CALCULATION FUNCTIONS ----------

function formatMoney(amount) {
  return CURRENCY + " " + amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Loop through the array and add up every amount
function calculateTotalExpenses(list) {
  let total = 0;
  for (let i = 0; i < list.length; i++) {
    total += list[i].amount;
  }
  return total;
}

function calculateRemainingBalance(budget, total) {
  return budget - total;
}

function calculatePercentageSpent(budget, total) {
  if (budget <= 0) {
    return 0;
  }
  return (total / budget) * 100;
}

// Loop through the array and group totals by category
function calculateCategoryTotals(list) {
  const totals = {};
  for (const expense of list) {
    if (totals[expense.category] === undefined) {
      totals[expense.category] = 0;
    }
    totals[expense.category] += expense.amount;
  }
  return totals;
}

// ---------- 4. DECISION MAKING (conditionals) ----------

function getBudgetStatus(budget, total, percent) {
  if (budget <= 0) {
    return { level: "info", message: "Set your budget to get started." };
  } else if (expenses.length === 0) {
    return { level: "info", message: "Budget set! Add your first expense." };
  } else if (percent > 100) {
    const over = total - budget;
    return { level: "danger", message: "Over budget by " + formatMoney(over) + "! Stop spending and review your expenses." };
  } else if (percent === 100) {
    return { level: "warning", message: "You have used your entire budget." };
  } else if (percent >= 80) {
    return { level: "warning", message: "Warning: you have used " + percent.toFixed(0) + "% of your budget. Spend carefully." };
  } else if (percent >= 50) {
    return { level: "good", message: "You are past the halfway mark. Keep an eye on your spending." };
  } else {
    return { level: "good", message: "Great job! You are well within your budget." };
  }
}

// ---------- 5. DISPLAY FUNCTIONS (DOM updates) ----------

function updateDashboard() {
  const total = calculateTotalExpenses(expenses);
  const remaining = calculateRemainingBalance(monthlyBudget, total);
  const percent = calculatePercentageSpent(monthlyBudget, total);
  const status = getBudgetStatus(monthlyBudget, total, percent);

  budgetDisplay.textContent = formatMoney(monthlyBudget);
  totalDisplay.textContent = formatMoney(total);
  remainingDisplay.textContent = formatMoney(remaining);

  // Red text when the balance is negative
  if (remaining < 0) {
    remainingDisplay.classList.add("negative");
  } else {
    remainingDisplay.classList.remove("negative");
  }

  // Progress bar (never wider than 100%)
  progressBar.style.width = Math.min(percent, 100) + "%";
  progressBar.className = "progress-bar";
  if (percent > 100) {
    progressBar.classList.add("danger");
  } else if (percent >= 80) {
    progressBar.classList.add("warning");
  }
  percentDisplay.textContent = percent.toFixed(1) + "% of budget used";

  // Status message
  statusMessage.textContent = status.message;
  statusMessage.className = "status " + status.level;
}

function renderExpenseList() {
  const selected = filterCategory.value;
  expenseList.innerHTML = "";

  let shown = 0;
  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];

    if (selected !== "All" && expense.category !== selected) {
      continue;
    }
    shown++;

    const row = document.createElement("tr");

    const numCell = document.createElement("td");
    numCell.textContent = shown;

    const nameCell = document.createElement("td");
    nameCell.textContent = expense.name;

    const catCell = document.createElement("td");
    catCell.textContent = expense.category;

    const amountCell = document.createElement("td");
    amountCell.textContent = formatMoney(expense.amount);

    const actionCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.dataset.id = expense.id;
    actionCell.appendChild(deleteBtn);

    row.append(numCell, nameCell, catCell, amountCell, actionCell);
    expenseList.appendChild(row);
  }

  // Show the table or the "empty" message
  if (shown === 0) {
    expenseTable.classList.add("hidden");
    emptyMessage.classList.remove("hidden");
    emptyMessage.textContent = expenses.length === 0
      ? "No expenses yet. Add one above."
      : "No expenses in this category.";
  } else {
    expenseTable.classList.remove("hidden");
    emptyMessage.classList.add("hidden");
  }
}

function renderCategoryBreakdown() {
  const totals = calculateCategoryTotals(expenses);
  const names = Object.keys(totals);
  categoryList.innerHTML = "";

  if (names.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nothing to show yet.";
    categoryList.appendChild(li);
    return;
  }

  for (let i = 0; i < names.length; i++) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    label.textContent = names[i];
    value.textContent = formatMoney(totals[names[i]]);
    li.append(label, value);
    categoryList.appendChild(li);
  }
}

// Keep the filter dropdown in sync with the categories in use
function updateFilterOptions() {
  const current = filterCategory.value;
  const totals = calculateCategoryTotals(expenses);

  filterCategory.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All categories";
  filterCategory.appendChild(allOption);

  for (const name of Object.keys(totals)) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    filterCategory.appendChild(option);
  }

  // Keep the previous choice if it still exists
  filterCategory.value = totals[current] !== undefined ? current : "All";
}

// One function that refreshes the whole page from the data
function refreshPage() {
  updateFilterOptions();
  updateDashboard();
  renderExpenseList();
  renderCategoryBreakdown();
}

// ---------- 6. EVENT HANDLERS ----------

function handleBudgetSubmit(event) {
  event.preventDefault();
  const value = parseFloat(budgetInput.value);

  if (isNaN(value) || value <= 0) {
    budgetError.textContent = "Please enter a budget greater than 0.";
    return;
  }

  budgetError.textContent = "";
  monthlyBudget = value;
  budgetInput.value = "";
  refreshPage();
}

function handleExpenseSubmit(event) {
  event.preventDefault();
  const name = expenseName.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const category = expenseCategory.value;

  if (monthlyBudget <= 0) {
    expenseError.textContent = "Please set your monthly budget first.";
    return;
  }
  if (name === "") {
    expenseError.textContent = "Please enter an expense name.";
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    expenseError.textContent = "Please enter an amount greater than 0.";
    return;
  }

  expenseError.textContent = "";
  expenses.push({ id: nextId, name: name, amount: amount, category: category });
  nextId++;

  expenseForm.reset();
  expenseName.focus();
  refreshPage();
}

// Event delegation: one listener handles every Delete button
function handleDeleteClick(event) {
  if (!event.target.classList.contains("delete-btn")) {
    return;
  }
  const id = Number(event.target.dataset.id);
  const index = expenses.findIndex(function (item) {
    return item.id === id;
  });
  if (index !== -1) {
    expenses.splice(index, 1);
  }
  refreshPage();
}

function handleReset() {
  if (confirm("Clear your budget and all expenses?")) {
    expenses = [];
    monthlyBudget = 0;
    nextId = 1;
    expenseError.textContent = "";
    budgetError.textContent = "";
    refreshPage();
  }
}

// ---------- 7. EVENT LISTENERS ----------
budgetForm.addEventListener("submit", handleBudgetSubmit);
expenseForm.addEventListener("submit", handleExpenseSubmit);
expenseList.addEventListener("click", handleDeleteClick);
filterCategory.addEventListener("change", renderExpenseList);
resetBtn.addEventListener("click", handleReset);

// ---------- 8. START ----------
refreshPage();
