# SpendWise

SpendWise is a budget tracking web app. The user sets a monthly budget, adds expenses, and the dashboard updates instantly to show the total spent, remaining balance, percentage of the budget used and a feedback message. Everything is displayed directly on the webpage.

## Project Files
- `index.html` - page structure (forms, dashboard, expense table)
- `style.css` - styling, progress bar colours and status message colours
- `script.js` - all JavaScript logic
- `README.md` - documentation

## How to Run
Open `index.html` in a browser. Set a budget, then add expenses using the form.

## Improvements Made This Week
- Replaced `prompt()` pop-ups with real HTML forms.
- Expenses are now stored in an array instead of separate variables.
- The dashboard (budget, total, remaining balance, progress bar and message) updates on the page, not just in the console.
- Added a table of expenses with a **Delete** button on each row.
- Added a category dropdown, a category filter and a "Spending by Category" breakdown.
- Added input validation with error messages.
- Added a **Reset All** button.

## How Conditionals Are Used
- `getBudgetStatus()` uses an `if / else if / else` chain to choose the feedback message: no budget set, no expenses yet, over budget (>100%), budget fully used (100%), warning (80% or more), halfway (50% or more) and doing well (below 50%).
- Form validation uses `if` statements to check for an empty name, an invalid amount or a missing budget before saving.
- The remaining balance turns red when `remaining < 0`, and the progress bar changes colour at 80% and 100%.
- The table is hidden and an "empty" message is shown when no expenses match the selected filter.

## How Arrays Are Used to Store Data
All expenses live in one array called `expenses`. Each item is an object:

```js
{ id: 1, name: "Lunch", amount: 350, category: "Food" }
```

- `push()` adds a new expense.
- `splice()` removes an expense when Delete is clicked (found with `findIndex()` using its unique `id`).
- Assigning an empty array resets the data.
- `for` loops go through the array to calculate the total, group totals by category and build the table rows.

## How the DOM Is Updated
- Elements are selected with `document.getElementById()`.
- Text is changed with `textContent` (budget, total, remaining, percentage and status message).
- The progress bar width is changed with `style.width`, and colours are changed with `classList.add()` and `classList.remove()`.
- Table rows are created with `document.createElement()`, filled in, and added with `appendChild()` and `append()`.
- `refreshPage()` calls `updateDashboard()`, `renderExpenseList()`, `renderCategoryBreakdown()` and `updateFilterOptions()` so the whole page always matches the data.

## How User Interactions Are Handled (Events)
- Budget form: `submit` event runs `handleBudgetSubmit()`.
- Expense form: `submit` event runs `handleExpenseSubmit()`.
- Delete buttons: one `click` listener on the table body (event delegation) runs `handleDeleteClick()`.
- Category filter: `change` event re-renders the list.
- Reset button: `click` event runs `handleReset()`.
- `event.preventDefault()` stops the forms from reloading the page.

**Flow:** user action -> event listener -> handler function -> data (array/variables) updated -> `refreshPage()` -> dashboard and list updated on screen.

## Functions
`formatMoney()`, `calculateTotalExpenses()`, `calculateRemainingBalance()`, `calculatePercentageSpent()`, `calculateCategoryTotals()`, `getBudgetStatus()`, `updateDashboard()`, `renderExpenseList()`, `renderCategoryBreakdown()`, `updateFilterOptions()`, `refreshPage()`, and the four event handler functions.

## Challenges and Solutions
1. **Delete buttons are created dynamically, so normal listeners did not work on them.**
   Solution: event delegation. One listener on the table body checks which button was clicked, and each button stores its expense `id` in `data-id`.
2. **Deleting by row position removed the wrong expense when the list was filtered.**
   Solution: give every expense a unique `id` and find it with `findIndex()` instead of using the row number.
3. **The form reloaded the page on submit and wiped the data.**
   Solution: call `event.preventDefault()` in the submit handlers.
4. **The progress bar overflowed when spending was above 100%.**
   Solution: use `Math.min(percent, 100)` for the width and change the bar to red.
5. **Typed input is text, so calculations gave wrong results.**
   Solution: convert with `parseFloat()` and check with `isNaN()` before saving.
