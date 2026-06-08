const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'expenses.json');

app.use(cors());
app.use(express.json());

// Helper to read/write JSON file acting as our database
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- API ENDPOINTS ---

// 1. Get all expenses
app.get('/api/expenses', (req, res) => {
  const expenses = readData();
  // Sort by date newest first
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(expenses);
});

// 2. Add an expense
app.post('/api/expenses', (req, res) => {
  const { amount, category, date, note } = req.body;
  const parsedAmount = Number(amount);

  // Validation
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return res.status(400).json({ error: "Amount must be greater than 0" });
  if (!category) return res.status(400).json({ error: "Category is required" });
  if (new Date(date) > new Date()) return res.status(400).json({ error: "Date cannot be in the future" });

  const expenses = readData();
  const newExpense = {
    id: Date.now().toString(), // Simple unique ID
    amount: parsedAmount,
    category,
    date,
    note: note || ""
  };

  expenses.push(newExpense);
  writeData(expenses);
  res.status(201).json(newExpense);
});

// 3. Edit an expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, date, note } = req.body;
  const parsedAmount = Number(amount);
  let expenses = readData();
  
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ error: "Expense not found" });

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return res.status(400).json({ error: "Amount must be greater than 0" });
  if (!category) return res.status(400).json({ error: "Category is required" });
  if (new Date(date) > new Date()) return res.status(400).json({ error: "Date cannot be in the future" });

  expenses[index] = { ...expenses[index], amount: parsedAmount, category, date, note };
  writeData(expenses);
  res.json(expenses[index]);
});

// 4. Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  let expenses = readData();
  
  const filtered = expenses.filter(e => e.id !== id);
  if (expenses.length === filtered.length) return res.status(404).json({ error: "Expense not found" });
  
  writeData(filtered);
  res.json({ message: "Expense deleted successfully" });
});

app.listen(PORT, () => console.log(`Backend spinning on port ${PORT}`));