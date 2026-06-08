# Mini Expense Tracker

A full-stack expense tracking application built for the **Studio Graphene Full Stack Developer Assessment — Exercise 2**. It lets a user log daily spending across categories, filter and manage records, and view visual summaries of where their money is going.

---

## Live Demo

- **Frontend:** [https://sanskriti100.github.io/FrontEnd_Expense/](https://sanskriti100.github.io/FrontEnd_Expense/)
- **Backend API:** [https://expenses-manager-api-ns5h.onrender.com/api/expenses](https://expenses-manager-api-ns5h.onrender.com/api/expenses)

> Note: The backend is hosted on Render's free tier and may take 30–60 seconds to wake up on the first request.

---

## Tech Stack

- **Frontend:** React 19 + Vite — fast dev server, modern React with hooks
- **Styling:** Tailwind CSS v4 — utility-first, rapid UI without custom CSS overhead
- **Charts:** Recharts — simple, composable chart components for React
- **Backend:** Node.js + Express — minimal, straightforward REST API setup
- **Storage:** JSON file (`expenses.json`) — lightweight persistence, no DB setup required
- **Frontend Deployment:** GitHub Pages + GitHub Actions — free static hosting with CI/CD on push
- **Backend Deployment:** Render — free Node.js hosting with auto-deploy from GitHub

---

## How to Run Locally

> Assumes you have **Node.js (v18+)** installed. Clone the repo first.

### 1. Backend

```bash
cd Backend
npm install
node server.js
```

The API will be available at `http://localhost:5000`.

### 2. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

The frontend auto-detects the environment — in development mode it points to `http://localhost:5000/api/expenses`.

---

## API Documentation

Base URL (local): `http://localhost:5000`  
Base URL (production): `https://expenses-manager-api-ns5h.onrender.com`

---

### `GET /api/expenses`

Returns all expenses, sorted by date (newest first).

**Response**
```json
[
  {
    "id": "1717200000000",
    "amount": 450,
    "category": "Food",
    "date": "2025-06-07",
    "note": "Lunch at cafe"
  }
]
```

---

### `POST /api/expenses`

Adds a new expense.

**Request Body**
```json
{
  "amount": 450,
  "category": "Food",
  "date": "2025-06-07",
  "note": "Lunch at cafe"
}
```

**Validation Rules**
- `amount` must be a positive number
- `category` is required
- `date` cannot be in the future

**Response** — `201 Created`
```json
{
  "id": "1717200000000",
  "amount": 450,
  "category": "Food",
  "date": "2025-06-07",
  "note": "Lunch at cafe"
}
```

**Error Response** — `400 Bad Request`
```json
{ "error": "Amount must be greater than 0" }
```

---

### `PUT /api/expenses/:id`

Updates an existing expense by ID.

**Request Body** — same fields as POST

**Response** — `200 OK` with the updated expense object

**Error Responses**
- `400` — validation failure
- `404` — expense not found

---

### `DELETE /api/expenses/:id`

Deletes an expense by ID.

**Response** — `200 OK`
```json
{ "message": "Expense deleted successfully" }
```

**Error Response** — `404 Not Found`
```json
{ "error": "Expense not found" }
```

---

## Project Structure

```
FrontEnd_Expense/
├── Backend/
│   ├── server.js          # Express app — all API routes and validation
│   ├── expenses.json      # Flat-file data store (auto-created on first write)
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main component — all UI, state, and data logic
│   │   ├── main.jsx       # React entry point
│   │   ├── index.css      # Global styles (minimal; Tailwind handles most)
│   │   └── assets/        # Static images
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.production    # Sets VITE_API_URL for the deployed backend
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy-pages.yml   # GitHub Actions — builds and deploys frontend to GitHub Pages
│
└── README.md
```

---

## Features Implemented

### Must Have 
- Add an expense with amount, category, date, and optional note
- View all expenses in a table, sorted by date (newest first)
- Edit and delete existing expenses
- Filter by category and by date range (All Time / This Month / Last Month)
- Summary panel — total spent this month, highest single expense, active filter total

### Should Have 
- Pie chart showing expenses by category (Recharts, toggle to show/hide)
- Currency formatted in Indian Rupee locale (`₹1,234.50`)
- Form validation — no negative amounts, no future dates, category is required (both client and server side)

### Bonus 
- Export visible expenses as a CSV download
- Persistence to a JSON file on the backend

---

## Known Issues & Honest Notes

- **JSON file storage resets on Render redeploy** — Render's filesystem is ephemeral. Data persists between requests but is lost when the server restarts or redeploys. A proper fix would be to swap `expenses.json` for a hosted database (MongoDB Atlas, Supabase, or SQLite on a persistent volume).

- **No loading state** — The table shows empty while the initial fetch is in flight. A spinner or skeleton row would improve the experience.

- **`confirm()` used for delete** — Native browser confirm dialogs are blocked in some sandboxed environments. A small inline confirmation or modal would be cleaner.

- **`Last Month` filter edge case** — The year is not checked, so January would incorrectly match December of the current year rather than the previous year. A one-line fix is planned.

- **No error feedback on failed fetches** — If the backend is unreachable, the app fails silently. Try/catch with a user-facing error message is a straightforward next step.

---

## Next Steps

Given more time, I would:

1. Replace the JSON file with a proper persistent store (SQLite via `better-sqlite3`, or a free MongoDB Atlas cluster)
2. Add a loading spinner and error banner for fetch failures
3. Fix the Last Month year-boundary bug
4. Replace `confirm()` with an in-page confirmation dialog
5. Add a budget-per-category feature with a progress bar showing spend vs. limit
6. Add a monthly bar chart alongside the pie chart for spending trends over time
7. Write backend unit tests with Vitest for the validation logic and API routes
8. Add search/filter by note text

---

## AI & Attribution

This project was built with reference to several YouTube tutorials for understanding full-stack patterns, including [this React + Node.js expense tracker walkthrough](https://youtu.be/XuFDcZABiDQ?si=YE8VDGBNa4r8O1zL) and others. The tutorials were used for learning and reference — the code was written and adapted by me, and I understand every part of it. I also used LLMs for code review and feedback during development.
