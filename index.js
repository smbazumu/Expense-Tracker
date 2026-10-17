const add = document.getElementById("add");
const expense = document.querySelector(".addexpense");
const saveExpense = document.querySelector(".saveExpense");
const closeBox = document.getElementById("close");
const income = document.getElementById("income");
const incomeDescr = document.getElementById("incomeDescription")
const incomereport = document.getElementById("incomereport");
const midright = document.querySelector(".middle-right");
const description = document.getElementById("description");
const amountTrans = document.getElementById("amount");
const selection = document.getElementById("category");
const expenseTrack = document.getElementById("expenseTrack");
const balance = document.getElementById("balance");
const budgetAmount = document.getElementById("budgetamount");
const budget = document.getElementById("budget");
const barchart = document.querySelector(".barchart");
const percentUsed = document.getElementById("percentbudget");
const percentValue = document.getElementById("budgetvalue");
const useDate = document.getElementById("expenseDate");

const housing = document.getElementById("housing");
const transport = document.getElementById("transport");
const fun = document.getElementById("fun");
const food = document.getElementById("food");
const other = document.getElementById("other");

const foodVal = document.getElementById("foodVal");
const housingVal = document.getElementById("housingVal");
const transportVal = document.getElementById("transportVal");
const otherVal = document.getElementById("otherVal");
const funVal = document.getElementById("funVal");

const monthSelection = document.getElementById("monthSelector")
const theme = document.getElementById("theme")
let themeStatus = false

const state = {
    budget: 0,
    transactions: []
};

const STORAGE_KEY = "expenseState";

function save() {
    try {
        const stringData = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, stringData);
    } catch (err) {
        console.error("Could not save:", err);
    }
}

function load() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.transactions)) {
                state.transactions = parsed.transactions;
            }
            if (typeof parsed.budget === "number") {
                state.budget = parsed.budget;
            }
        }
    } catch (err) {
        console.error("Could not load saved data:", err);
    }
}

function money(number) {
    const formatted = number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return "$" + formatted;
}

function parseAmount(str) {
    const cleanStr = String(str).replace(/[^0-9.]/g, "");
    const parsedNumber = Number(cleanStr);
    if (Number.isFinite(parsedNumber)) {
        return parsedNumber;
    } else {
        return 0;
    }
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();

    let month = today.getMonth() + 1;
    month = String(month).padStart(2, "0");

    let day = today.getDate();
    day = String(day).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function getMonthLong() {
    const today = new Date()
    
    let year = today.getFullYear();
    let month = today.toLocaleString('default', { month: 'long' });

    return month + " " + year
}

function dateLabel(dateStr) {
    const parts = dateStr.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const transactionDate = new Date(year, month - 1, day);
    const currentDate = new Date();

    const todayMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const timeDifference = todayMidnight - transactionDate;
    const diffDays = Math.round(timeDifference / 86400000);

    if (diffDays === 0) {
        return "Today";
    }
    if (diffDays === 1) {
        return "Yesterday";
    }
    return dateStr;
}

function formatInput(element) {
    const raw = element.value.replace(/[^0-9.]/g, "");
    const parts = raw.split(".");
    const intPart = parts[0];

    let intFormatted = "";
    if (intPart) {
        intFormatted = Number(intPart).toLocaleString("en-US");
    }

    if (raw.includes(".")) {
        let decimals = "";
        if (parts[1]) {
            decimals = parts[1].slice(0, 2);
        }
        if (intFormatted === "") {
            intFormatted = "0";
        }
        element.value = intFormatted + "." + decimals;
    } else {
        element.value = intFormatted;
    }
}

function renderTransactions() {
    midright.innerHTML = "";

    const selectedMonth = monthSelection.value

    for (let i = 0; i < state.transactions.length; i++) {
        const t = state.transactions[i];

        if (t.date.startsWith(selectedMonth) === false) {
            continue;
        }

        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "15px";
        row.style.borderBottom = "1px solid black";

        const info = document.createElement("div");
        const title = document.createElement("h4");
        const sub = document.createElement("p");
        sub.style.fontSize = "14px";

        title.textContent = t.description;
        sub.textContent = t.category + " · " + dateLabel(t.date);

        info.append(title, sub);

        const amount = document.createElement("strong");
        amount.style.fontSize = "18px";
        if (t.category === "Income") {
            amount.textContent = `+${money(t.amount)}`;
            amount.style.color = "green"
        } else {
            amount.textContent = `-${money(t.amount)}`;
            amount.style.color = "red"
        }

        row.append(info, amount);
        midright.appendChild(row);
    }
}

function renderChart() {
    barchart.innerHTML = "";
    const totals = {};
    const selectedMonth = monthSelection.value

    for (let i = 0; i < state.transactions.length; i++) {
        const t = state.transactions[i];
        if (t.type === "expense" && t.date.startsWith(selectedMonth)) {
            if (totals[t.date] === undefined) {
                totals[t.date] = 0;
            }
            totals[t.date] = totals[t.date] + t.amount;
        }
    }

    const dates = Object.keys(totals).sort();

    let max = 1;
    for (let date in totals) {
        if (totals[date] > max) {
            max = totals[date];
        }
    }

    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];

        const wrapper = document.createElement("div");
        wrapper.className = "spending";

        const total = document.createElement("p");
        total.className = "daily";
        total.textContent = `$${totals[date].toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}`;

        const bar = document.createElement("div");
        bar.className = "bar";

        let calculatedHeight = (totals[date] / max) * 100;
        if (calculatedHeight < 4) {
            calculatedHeight = 4;
        }
        bar.style.height = calculatedHeight + "px";

        const dayNum = document.createElement("p");
        dayNum.className = "numDay";
        dayNum.textContent = Number(date.slice(8, 10));

        wrapper.append(bar, total, dayNum);
        barchart.appendChild(wrapper);
    }
}

function renderMonth() {
    const savedSelection = monthSelection.value
    monthSelection.innerHTML = ""
    
    const today = useDate.value || getTodayDate();
    const [startYear, startMonth] = today.split('-');
    const defaultMonth = `${startYear}-${startMonth}`;

    const monthList = [defaultMonth];

    for (let i = 0; i < state.transactions.length; i++) {
        const t = state.transactions[i];
        const transMonth = t.date.slice(0, 7);

        if (monthList.includes(transMonth) === false) {
            monthList.push(transMonth);
        }
    }

    monthList.sort()


    for (let i = 0; i < monthList.length; i++) {
        const currentMonth = monthList[i];
        const [year, month] = currentMonth.split('-')

        let monthValue = `${year}-${month}`
    
        let monthName = new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long' })

        const option = document.createElement("option")
        option.value = monthValue
        option.textContent = `${monthName} ${year}`
        monthSelection.appendChild(option)
    }
    if (savedSelection !== "") {
        monthSelection.value = savedSelection;
    } else {
        monthSelection.value = defaultMonth;
    }
}

function renderSummary() {
    const selectedMonth = monthSelection.value

    const parts = selectedMonth.split('-')
    const year = Number(parts[0])
    const month = Number(parts[1])

    const previousDate = new Date(year, month - 2, 1)
    const previousMonth = previousDate.getFullYear() + '-' + String(previousDate.getMonth() + 1).padStart(2, '0')

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalFood = 0;
    let totalHousing = 0;
    let totalTransport = 0;
    let totalFun = 0;
    let totalOther = 0;

    let previousIncome = 0
    let previousExpenses = 0

    for (let i = 0; i < state.transactions.length; i++) {
        const t = state.transactions[i];

        if (t.date.startsWith(selectedMonth)) {
            if (t.type === "income") {
                totalIncome = totalIncome + t.amount;
            }
            if (t.type === "expense") {
                totalExpenses = totalExpenses + t.amount;

                if (t.category === "Food") {
                    totalFood = totalFood + t.amount;
                }
                if (t.category === "Housing") {
                    totalHousing = totalHousing + t.amount;
                }
                if (t.category === "Transport") {
                    totalTransport = totalTransport + t.amount;
                }
                if (t.category === "Fun") {
                    totalFun = totalFun + t.amount;
                }
                if (t.category === "Other") {
                    totalOther = totalOther + t.amount;
                }
            }
        }

        if (t.date.startsWith(previousMonth)) {
            if (t.type === "income") {
                previousIncome = previousIncome + t.amount
            }
            if (t.type === "expense") {
                previousExpenses = previousExpenses + t.amount
            }
        }
    }

    const currentBalance = totalIncome - totalExpenses
    const previousBalance = previousIncome - previousExpenses

    incomereport.textContent = money(totalIncome);
    expenseTrack.textContent = money(totalExpenses);
    balance.textContent = money(totalIncome - totalExpenses);
    budget.textContent = money(state.budget);

    function showChange(elementId, currentAmount, previousAmount) {
        const difference = currentAmount - previousAmount
        const element = document.getElementById(elementId)

        let pctChange = (Math.abs(difference) * 100) / previousAmount

        if (difference > 0) {
            element.textContent = "↑" + pctChange.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "% vs last month"
            element.style.color = "green"
        } else if (difference < 0) {
            element.textContent = "↓" + pctChange.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "% vs last month"
            element.style.color = "red"
        } else {
            element.textContent = "= " + 0 + "% vs last month"
        }
    }

    showChange("incomechange", totalIncome, previousIncome)
    showChange("balancechange", currentBalance, previousBalance)
    showChange("expenseschange", totalExpenses, previousExpenses)

    let pct = 0;
    if (state.budget > 0) {
        pct = (totalExpenses * 100) / state.budget;
    }

    let pct1 = 0;
    let pct2 = 0;
    let pct3 = 0;
    let pct4 = 0;
    let pct5 = 0;

    if (totalExpenses > 0) {
        pct1 = (totalFood * 100) / totalExpenses;
        pct2 = (totalHousing * 100) / totalExpenses;
        pct3 = (totalTransport * 100) / totalExpenses;
        pct4 = (totalFun * 100) / totalExpenses;
        pct5 = (totalOther * 100) / totalExpenses;
    }

    percentUsed.textContent = pct.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "% used";
    food.textContent = pct1.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "%";
    housing.textContent = pct2.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "%";
    transport.textContent = pct3.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "%";
    fun.textContent = pct4.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "%";
    other.textContent = pct5.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "%";

    percentValue.value = pct;
    housingVal.value = pct2;
    foodVal.value = pct1;
    transportVal.value = pct3;
    funVal.value = pct4;
    otherVal.value = pct5;
}

function render() {
    renderMonth();
    renderSummary();
    renderTransactions();
    renderChart();
}

function closeExpenseBox() {
    description.value = "";
    amountTrans.value = "";
    expense.style.display = "none";
}

add.addEventListener("click", function () {
    expense.style.display = "flex";
});

closeBox.addEventListener("click", closeExpenseBox);

document.documentElement.addEventListener("click", function (event) {
    if (expense.style.display === "flex") {
        if (!expense.contains(event.target)) {
            if (!add.contains(event.target)) {
                closeExpenseBox();
            }
        }
    }
});

amountTrans.addEventListener("input", function () {
    formatInput(amountTrans);
});

saveExpense.addEventListener("click", function () {
    const amount = parseAmount(amountTrans.value);
    if (amount <= 0) {
        return;
    }

    let finalDescription = description.value.trim();
    if (finalDescription === "") {
        finalDescription = "Expense";
    }

    let finalDate = useDate.value;
    if (finalDate === "") {
        finalDate = getTodayDate();
    }

    state.transactions.push({
        type: "expense",
        description: finalDescription,
        category: selection.value,
        amount: amount,
        date: finalDate
    });

    save();
    render();
    closeExpenseBox();
});

income.addEventListener("input", function () {
    formatInput(income);
});

income.addEventListener("blur", function () {
    const amount = parseAmount(income.value);
    if (amount > 0) {
        state.transactions.push({
            type: "income",
            description: incomeDescr.value,
            category: "Income",
            amount: amount,
            date: useDate.value || getTodayDate()
        });
        save();
        render();
    }
    income.value = "";
    incomeDescr.value = "";
});

budgetAmount.addEventListener("input", function () {
    formatInput(budgetAmount);
});

budgetAmount.addEventListener("blur", function () {
    const amount = parseAmount(budgetAmount.value);
    if (amount > 0) {
        state.budget = state.budget + amount;
        save();
        render();
    }
    budgetAmount.value = "";
});

monthSelection.addEventListener('change', () => {
    render();
})

theme.addEventListener('click', () => {
    if (themeStatus === false) {
        document.body.classList.add("dark")
        theme.src = "icon-sun.svg"
        themeStatus = true
    } else {
        document.body.classList.remove("dark")
        theme.src = "icon-moon.png"
        themeStatus = false
    }
})

useDate.value = getTodayDate();
load();
render();