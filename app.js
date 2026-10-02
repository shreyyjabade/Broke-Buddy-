/* =========================================================
   BROKE BUDDY
   Main JavaScript File
   ========================================================= */


/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultData = {
    budget: 10000,

    expenses: [],

    goal: {
        name: "Emergency fund",
        target: 5000,
        saved: 0
    },

    dark: false
};


/* =========================================================
   LOAD DATA FROM LOCAL STORAGE
========================================================= */

let data;

try {

    const savedData =
        localStorage.getItem("brokeBuddyData");

    data = savedData
        ? JSON.parse(savedData)
        : structuredClone(defaultData);

} catch (error) {

    console.error(
        "Could not load saved data:",
        error
    );

    data = structuredClone(defaultData);
}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    localStorage.setItem(
        "brokeBuddyData",
        JSON.stringify(data)
    );

}


/* =========================================================
   MONEY FORMATTER
========================================================= */

function money(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const elements = {

    remaining:
        document.getElementById("remaining"),

    spentText:
        document.getElementById("spentText"),

    budgetText:
        document.getElementById("budgetText"),

    budgetBar:
        document.getElementById("budgetBar"),

    transactionCount:
        document.getElementById("transactionCount"),

    averageSpend:
        document.getElementById("averageSpend"),

    biggestSpend:
        document.getElementById("biggestSpend"),

    savedAmount:
        document.getElementById("savedAmount"),

    transactions:
        document.getElementById("transactions"),

    buddyMessage:
        document.getElementById("buddyMessage"),

    streakText:
        document.getElementById("streakText"),

    goalName:
        document.getElementById("goalName"),

    goalSaved:
        document.getElementById("goalSaved"),

    goalTarget:
        document.getElementById("goalTarget"),

    goalPercent:
        document.getElementById("goalPercent"),

    goalFill:
        document.getElementById("goalFill"),

    insight:
        document.getElementById("insight"),

    modal:
        document.getElementById("modal"),

    toast:
        document.getElementById("toast"),

    checkerResult:
        document.getElementById("checkerResult"),

    checkAmount:
        document.getElementById("checkAmount"),

    budgetInput:
        document.getElementById("budgetInput"),

    expenseName:
        document.getElementById("expenseName"),

    expenseAmount:
        document.getElementById("expenseAmount"),

    expenseCategory:
        document.getElementById("expenseCategory")

};


/* =========================================================
   INITIALIZE APP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyTheme();

        updateDashboard();

        setupKeyboardShortcuts();

    }
);


/* =========================================================
   UPDATE ENTIRE DASHBOARD
========================================================= */

function updateDashboard() {

    const totalSpent =
        getTotalSpent();

    const remaining =
        data.budget - totalSpent;


    updateBudget(
        totalSpent,
        remaining
    );

    updateStats(
        totalSpent
    );

    renderTransactions();

    updateGoal();

    updateInsight(
        totalSpent
    );

    updateBuddy(
        totalSpent,
        remaining
    );

}


/* =========================================================
   TOTAL SPENDING
========================================================= */

function getTotalSpent() {

    return data.expenses.reduce(
        (total, expense) => {

            return total +
                Number(expense.amount || 0);

        },
        0
    );

}


/* =========================================================
   BUDGET
========================================================= */

function updateBudget(
    totalSpent,
    remaining
) {

    if (!elements.remaining) return;


    elements.remaining.textContent =
        money(
            Math.max(remaining, 0)
        );


    elements.spentText.textContent =
        money(totalSpent) +
        " spent";


    elements.budgetText.textContent =
        money(data.budget) +
        " budget";


    const percentage =
        data.budget > 0
            ? (totalSpent / data.budget) * 100
            : 0;


    elements.budgetBar.style.width =
        Math.min(percentage, 100) +
        "%";


    /* Budget bar colour */

    if (percentage >= 100) {

        elements.budgetBar.style.background =
            "#ff4d4d";

    }

    else if (percentage >= 80) {

        elements.budgetBar.style.background =
            "#ffad33";

    }

    else if (percentage >= 60) {

        elements.budgetBar.style.background =
            "#b7f34a";

    }

    else {

        elements.budgetBar.style.background =
            "#171717";

    }

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStats(
    totalSpent
) {

    const count =
        data.expenses.length;


    const average =
        count > 0
            ? totalSpent / count
            : 0;


    const biggest =
        count > 0
            ? Math.max(
                ...data.expenses.map(
                    expense =>
                        Number(
                            expense.amount
                        )
                )
            )
            : 0;


    elements.transactionCount.textContent =
        count;


    elements.averageSpend.textContent =
        money(
            Math.round(average)
        );


    elements.biggestSpend.textContent =
        money(biggest);


    elements.savedAmount.textContent =
        money(
            Math.max(
                data.budget - totalSpent,
                0
            )
        );

}


/* =========================================================
   ADD EXPENSE
========================================================= */

function addExpense(event) {

    event.preventDefault();


    const name =
        elements.expenseName.value.trim();


    const amount =
        Number(
            elements.expenseAmount.value
        );


    const category =
        elements.expenseCategory.value;


    /* Validation */

    if (!name) {

        showToast(
            "Bestie, what did you buy? 😭"
        );

        return;
    }


    if (
        !amount ||
        amount <= 0
    ) {

        showToast(
            "Enter a valid amount 😭"
        );

        return;
    }


    /* Create expense */

    const expense = {

        id:
            Date.now(),

        name:
            name,

        amount:
            amount,

        category:
            category,

        date:
            new Date().toISOString()

    };


    data.expenses.push(
        expense
    );


    saveData();

    updateDashboard();

    closeModal();


    /* Reset form */

    elements.expenseName.value =
        "";

    elements.expenseAmount.value =
        "";

    elements.expenseCategory.value =
        "Food";


    showToast(
        "Expense added. Your wallet felt that. 💀"
    );

}


/* =========================================================
   DELETE EXPENSE
========================================================= */

function deleteExpense(
    index
) {

    if (
        index < 0 ||
        index >= data.expenses.length
    ) {

        return;
    }


    const expense =
        data.expenses[index];


    data.expenses.splice(
        index,
        1
    );


    saveData();

    updateDashboard();


    showToast(
        `"${expense.name}" deleted. Damage control activated. ✨`
    );

}


/* =========================================================
   RENDER TRANSACTIONS
========================================================= */

function renderTransactions() {

    if (!elements.transactions)
        return;


    if (
        data.expenses.length === 0
    ) {

        elements.transactions.innerHTML = `

            <div
                style="
                    text-align:center;
                    color:#888;
                    padding:30px;
                "
            >
                No financial chaos yet.
                Suspicious. 👀
            </div>

        `;

        return;
    }


    const icons = {

        Food:
            ["🍔", "#ffd9a8"],

        Travel:
            ["🚕", "#c8e8ff"],

        Shopping:
            ["🛍️", "#ffc9dd"],

        Entertainment:
            ["🎬", "#d8c7ff"],

        College:
            ["📚", "#d5f5a3"],

        Bills:
            ["📱", "#dddddd"],

        Other:
            ["✨", "#eeeeee"]

    };


    elements.transactions.innerHTML =
        data.expenses
            .slice()
            .reverse()
            .map(
                (expense, reversedIndex) => {

                    const actualIndex =
                        data.expenses.length -
                        1 -
                        reversedIndex;


                    const icon =
                        icons[
                            expense.category
                        ] || icons.Other;


                    return `

                        <div
                            class="transaction"
                        >

                            <div
                                class="transaction-left"
                            >

                                <div
                                    class="transaction-icon"
                                    style="
                                        background:
                                        ${icon[1]}
                                    "
                                >
                                    ${icon[0]}
                                </div>


                                <div>

                                    <div
                                        class="transaction-name"
                                    >
                                        ${escapeHTML(
                                            expense.name
                                        )}
                                    </div>


                                    <div
                                        class="transaction-category"
                                    >
                                        ${expense.category}
                                    </div>

                                </div>

                            </div>


                            <div>

                                <span
                                    class="amount"
                                >
                                    -${money(
                                        expense.amount
                                    )}
                                </span>


                                <button
                                    class="delete"
                                    onclick="
                                        deleteExpense(
                                            ${actualIndex}
                                        )
                                    "
                                    title="Delete"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CAN I AFFORD IT?
========================================================= */

function checkAfford() {

    const amount =
        Number(
            elements.checkAmount.value
        );


    const result =
        elements.checkerResult;


    if (
        !amount ||
        amount <= 0
    ) {

        result.style.display =
            "block";

        result.className =
            "checker-result danger";

        result.textContent =
            "Bestie... enter an actual amount 😭";

        return;
    }


    const totalSpent =
        getTotalSpent();


    const remaining =
        data.budget -
        totalSpent;


    result.style.display =
        "block";


    if (
        remaining <= 0
    ) {

        result.className =
            "checker-result danger";

        result.textContent =
            "Your budget is already cooked. 💀";

        return;
    }


    const percentage =
        (amount / remaining) *
        100;


    if (
        amount <= remaining * 0.10
    ) {

        result.className =
            "checker-result safe";

        result.textContent =
            "Lowkey yes. Your wallet can handle this. 🟢";

    }

    else if (
        amount <= remaining * 0.25
    ) {

        result.className =
            "checker-result safe";

        result.textContent =
            "Hmm... doable. But don't make this a habit. 👀";

    }

    else if (
        amount <= remaining * 0.5
    ) {

        result.className =
            "checker-result danger";

        result.textContent =
            "That's a chunky purchase. Think twice, bestie. 🫠";

    }

    else {

        result.className =
            "checker-result danger";

        result.textContent =
            "Respectfully... PUT IT BACK. 💀";

    }

}


/* =========================================================
   SAVINGS GOAL
========================================================= */

function updateGoal() {

    const target =
        Number(
            data.goal.target
        );


    const saved =
        Number(
            data.goal.saved
        );


    const percentage =
        target > 0
            ? Math.min(
                (saved / target) * 100,
                100
            )
            : 0;


    elements.goalName.textContent =
        data.goal.name;


    elements.goalSaved.textContent =
        saved.toLocaleString(
            "en-IN"
        );


    elements.goalTarget.textContent =
        target.toLocaleString(
            "en-IN"
        );


    elements.goalPercent.textContent =
        Math.round(
            percentage
        ) + "%";


    elements.goalFill.style.width =
        percentage + "%";

}


/* =========================================================
   ADD MONEY TO GOAL
========================================================= */

function addToGoal() {

    if (
        data.goal.saved >=
        data.goal.target
    ) {

        showToast(
            "Goal completed! We love financial character development. 🏆"
        );

        return;
    }


    data.goal.saved =
        Math.min(
            data.goal.saved + 100,
            data.goal.target
        );


    saveData();

    updateDashboard();


    if (
        data.goal.saved >=
        data.goal.target
    ) {

        showToast(
            "GOAL COMPLETE! Main character behaviour. 🏆"
        );

    }

    else {

        showToast(
            "₹100 saved. Main character behaviour. 🫡"
        );

    }

}


/* =========================================================
   BUDGET SETTINGS
========================================================= */

function saveBudget() {

    const newBudget =
        Number(
            elements.budgetInput.value
        );


    if (
        !newBudget ||
        newBudget <= 0
    ) {

        showToast(
            "Enter a valid budget 😭"
        );

        return;
    }


    data.budget =
        newBudget;


    saveData();

    updateDashboard();


    elements.budgetInput.value =
        "";


    showToast(
        "Budget updated. Financial era unlocked. ✨"
    );

}


/* =========================================================
   SPENDING INSIGHT
========================================================= */

function updateInsight(
    totalSpent
) {

    if (
        data.expenses.length === 0
    ) {

        elements.insight.textContent =
            "Add some expenses and I'll analyse your spending habits.";

        return;
    }


    const categoryTotals = {};


    data.expenses.forEach(
        expense => {

            const category =
                expense.category;


            categoryTotals[category] =
                (
                    categoryTotals[category] ||
                    0
                ) +
                Number(
                    expense.amount
                );

        }
    );


    const biggestCategory =
        Object.entries(
            categoryTotals
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )[0];


    const budgetPercentage =
        data.budget > 0
            ? Math.round(
                (
                    totalSpent /
                    data.budget
                ) * 100
            )
            : 0;


    elements.insight.innerHTML = `

        You've used
        <strong>
            ${budgetPercentage}%
        </strong>
        of your budget.

        Your biggest money sink is

        <strong>
            ${biggestCategory[0]}
        </strong>

        at

        <strong>
            ${money(biggestCategory[1])}
        </strong>.

    `;

}


/* =========================================================
   BUDDY PERSONALITY
========================================================= */

function updateBuddy(
    totalSpent,
    remaining
) {

    if (!elements.buddyMessage)
        return;


    if (
        totalSpent === 0
    ) {

        elements.buddyMessage.textContent =
            "No spending yet. We love this era. 🧘";

        elements.streakText.textContent =
            "🔥 0 day spending streak";

        return;
    }


    const percentage =
        data.budget > 0
            ? (
                totalSpent /
                data.budget
            ) * 100
            : 100;


    if (
        percentage < 20
    ) {

        elements.buddyMessage.textContent =
            "You're actually cooking. 🔥";

    }

    else if (
        percentage < 40
    ) {

        elements.buddyMessage.textContent =
            "Okayyy, financially responsible era? 👀";

    }

    else if (
        percentage < 60
    ) {

        elements.buddyMessage.textContent =
            "We're chilling... for now. 😌";

    }

    else if (
        percentage < 80
    ) {

        elements.buddyMessage.textContent =
            "Bestie, maybe chill with the swipes. 👀";

    }

    else if (
        percentage < 100
    ) {

        elements.buddyMessage.textContent =
            "The budget is giving emergency meeting. 🚨";

    }

    else {

        elements.buddyMessage.textContent =
            "Financially? We're in the trenches. 💀";

    }


    const streak =
        calculateStreak();


    elements.streakText.textContent =
        `🔥 ${streak} day spending streak`;

}


/* =========================================================
   SPENDING STREAK
========================================================= */

function calculateStreak() {

    if (
        data.expenses.length === 0
    ) {

        return 0;
    }


    const dates =
        [
            ...new Set(
                data.expenses.map(
                    expense =>
                        new Date(
                            expense.date
                        ).toDateString()
                )
            )
        ];


    const today =
        new Date();


    let streak = 0;


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const checkDate =
            new Date(today);


        checkDate.setDate(
            today.getDate() - i
        );


        const exists =
            dates.includes(
                checkDate.toDateString()
            );


        if (exists) {

            streak++;

        }

        else {

            break;

        }

    }


    return streak;

}


/* =========================================================
   MODAL
========================================================= */

function openModal() {

    if (!elements.modal)
        return;


    elements.modal.classList.add(
        "show"
    );


    setTimeout(
        () => {

            elements.expenseName?.focus();

        },
        100
    );

}


function closeModal() {

    if (!elements.modal)
        return;


    elements.modal.classList.remove(
        "show"
    );

}


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

if (elements.modal) {

    elements.modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.modal
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================================
   TOAST NOTIFICATION
========================================================= */

let toastTimer;


function showToast(
    message
) {

    if (!elements.toast)
        return;


    elements.toast.textContent =
        message;


    elements.toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                elements.toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   DARK MODE
========================================================= */

function toggleTheme() {

    data.dark =
        !data.dark;


    applyTheme();

    saveData();


    showToast(
        data.dark
            ? "Dark mode activated. Night owl energy 🌙"
            : "Light mode activated. Touch grass era ☀️"
    );

}


function applyTheme() {

    if (
        data.dark
    ) {

        document.body.classList.add(
            "dark"
        );

    }

    else {

        document.body.classList.remove(
            "dark"
        );

    }

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            /* ESC = close modal */

            if (
                event.key === "Escape"
            ) {

                closeModal();

            }


            /* CTRL/CMD + K = add expense */

            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                openModal();

            }

        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   RESET ALL DATA
========================================================= */

function resetApp() {

    const confirmed =
        confirm(
            "Are you sure? This will delete all your expenses and savings data."
        );


    if (!confirmed)
        return;


    data =
        structuredClone(
            defaultData
        );


    saveData();

    applyTheme();

    updateDashboard();


    showToast(
        "Fresh start unlocked. New financial era. ✨"
    );

}


/* =========================================================
   EXPORT DATA
========================================================= */

function exportData() {

    const file =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            file
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "broke-buddy-data.json";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Your money data has been exported. 📦"
    );

}


/* =========================================================
   CONSOLE MESSAGE
========================================================= */

console.log(
    "%cBroke Buddy 💸",
    `
        font-size: 24px;
        font-weight: bold;
        color: #78a928;
    `
);

console.log(
    "Your wallet is being watched. 👀"
);
