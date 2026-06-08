
import { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV
  ? 'http://localhost:5000/api/expenses'
  : 'https://expenses-manager-api-ns5h.onrender.com/api/expenses');

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ amount: '', category: '', date: '', note: '' });
  const [editingId, setEditingId] = useState(null);
  const [showCategoryPieChart, setShowCategoryPieChart] = useState(false);
  
  const categoryColor = (cat) => CATEGORIES.indexOf(cat) >= 0 ? COLORS[CATEGORIES.indexOf(cat) % COLORS.length] : '#E5E7EB';

  const primaryBtn = "bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-sm transition";
  const inputBase = "mt-1 border border-gray-200 rounded p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200";
  const inputUniform = inputBase + " w-full sm:w-48";
  const inputFilter = inputUniform;

  const hexToRgba = (hex, alpha = 0.12) => {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const categoryIconEmoji = (name) => {
    switch (name) {
      case 'Food': return '🍽️';
      case 'Transport': return '🚗';
      case 'Bills': return '⚡';
      case 'Entertainment': return '🎮';
      case 'Other': return '⋯';
      default: return '•';
    }
  };

  const normalizeExpense = (expense) => ({
    ...expense,
    amount: Number(expense?.amount) || 0,
    note: expense?.note || '',
  });

  // Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('All'); // All, This Month, Last Month

  const fetchExpenses = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setExpenses(data.map(normalizeExpense));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0 || new Date(formData.date) > new Date()) {
      alert("Invalid Form Submission");
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setFormData({ amount: '', category: '', date: '', note: '' });
    setEditingId(null);
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this expense?")) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchExpenses();
    }
  };

  // --- Data Transformation & Filtering ---
  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    
    const expDate = new Date(exp.date);
    const now = new Date();
    let matchesDate = true;

    if (filterDateRange === 'This Month') {
      matchesDate = expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    } else if (filterDateRange === 'Last Month') {
      matchesDate = expDate.getMonth() === (now.getMonth() - 1 === -1 ? 11 : now.getMonth() - 1);
    }
    return matchesCategory && matchesDate;
  });

  const toAmount = (expense) => Number(expense.amount) || 0;

  // Summary Metrics
  const totalSpentThisMonth = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + toAmount(e), 0);

  const highestSingleExpense = expenses.length > 0 ? Math.max(...expenses.map(e => toAmount(e))) : 0;

  // Pie Chart Data (all expenses, not filtered)
  const pieChartData = CATEGORIES.map((category) => ({
    name: category,
    value: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + toAmount(expense), 0),
  })).filter((item) => item.value > 0);

  const totalFilteredSpent = filteredExpenses.reduce((sum, expense) => sum + toAmount(expense), 0);

  // CSV Export Utility
  const exportToCSV = () => {
    const headers = ['Date,Category,Amount,Note\n'];
    const rows = filteredExpenses.map(e => `${e.date},${e.category},${toAmount(e)},"${e.note}"`);
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'expenses.csv');
    a.click();
  };

  return (
   <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-indigo-50 via-sky-50 to-white p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
       <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 text-center">Mini Expense Tracker</h1>
        <p className="text-center text-sm text-gray-500">Quickly log expenses and get simple visual insights.</p>

        {/* Summary Widgets */}
        <div className="max-w-6xl mx-auto space-y-6 px-1 sm:px-2">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
         {[
      { key: 'spent', label: 'Spent This Month', value: `₹${totalSpentThisMonth.toLocaleString('en-IN')}`, color: '#2563EB' },
      { key: 'highest', label: 'Highest Single Expense', value: `₹${highestSingleExpense.toLocaleString('en-IN')}`, color: '#DC2626' },
      { key: 'filtered', label: 'Active Filters Total', value: `₹${totalFilteredSpent.toLocaleString('en-IN')}`, color: '#16A34A' },
      ].map(item => (
      <li
      key={item.key}
      className="w-full backdrop-blur-sm p-4 rounded-xl shadow relative pl-4 flex flex-col items-center justify-center text-center space-y-1"
      style={{ background: hexToRgba(item.color, 0.10) }}
       >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-1 rounded-l" style={{ background: item.color }}></span>
                <div>
                  <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="w-full flex justify-center sm:justify-end">
              <button
  onClick={exportToCSV}
  aria-label="Export CSV"
  className="relative inline-flex items-center bg-linear-to-r from-indigo-600 to-purple-600 text-white pl-14 pr-6 py-3 rounded-full font-medium shadow-md ring-2 ring-white/30 hover:from-indigo-700 hover:to-purple-700 transition-all"
>
  <span className="absolute left-1 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-black"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2a1 1 0 0 1 1 1v10.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L11 13.586V3a1 1 0 0 1 1-1z" />
    </svg>
  </span>

  <span className="uppercase tracking-wider">
    CSV
  </span>
</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form & Analytics */}
          <div className="space-y-6 lg:col-span-1">
            {/* Input Form */}
           <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-full p-5 md:p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6 relative"
         >
    <h2 className="text-2xl font-serif font-bold text-gray-900">
      {editingId ? "Edit Expense" : "New Expense"}
    </h2>

  <div>
    <label className="block text-xs font-semibold text-gray-700">AMOUNT</label>
    <div className="relative mt-2">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
        ₹
      </span>

      <input
        required
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        value={formData.amount}
        onChange={e => setFormData({ ...formData, amount: e.target.value })}
        className="w-full border border-gray-300 rounded-xl p-5 pl-10 text-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  </div>

  <div>
    <label className="block text-xs font-semibold text-gray-700">CATEGORY</label>
    <div className="mt-2 flex flex-wrap gap-2">
      {CATEGORIES.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => setFormData({ ...formData, category: c })}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-full border transition-all ${
            formData.category === c
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs">
            {categoryIconEmoji(c)}
          </span>
          <span className="text-sm font-medium">{c}</span>
        </button>
      ))}
    </div>
  </div>

  <div>
    <div>
  <label className="block text-xs font-semibold text-gray-700">DATE</label>

  <input
    required
    type="date"
    max={new Date().toISOString().split("T")[0]}
    value={formData.date}
    onChange={e => setFormData({ ...formData, date: e.target.value })}
    className="mt-2 w-full border border-gray-300 rounded-xl p-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
</div>
  </div>

  <div>
    <label className="block text-xs font-semibold text-gray-700">NOTE</label>
    <textarea
      rows={4}
      maxLength={200}
      placeholder="What was this for?"
      className="mt-2 w-full border border-gray-300 rounded-xl p-3 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
      value={formData.note}
      onChange={e => setFormData({ ...formData, note: e.target.value })}
    />
    <p className="text-xs text-gray-500 mt-2">
      Optional — a quick reminder for later
    </p>
  </div>

  <div className="flex justify-center">
    <button
      type="submit"
      className="relative inline-flex items-center bg-linear-to-r from-indigo-600 to-purple-600 text-white pl-14 pr-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
      aria-label="Add Expense"
    >
      <span className="absolute left-1 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      <span className="uppercase tracking-wider">
        {editingId ? "Update Expense" : "Add Expense"}
      </span>
    </button>
  </div>
</form>
            {/* Visual Analytics Chart */}
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Category Pie Chart</h3>
              <button
                type="button"
                onClick={() => setShowCategoryPieChart(prev => !prev)}
                className={`${primaryBtn} mt-1`}
              >
                {showCategoryPieChart ? 'Hide Pie Chart' : 'Show Pie Chart'}
              </button>

              {showCategoryPieChart && pieChartData.length > 0 && (
                <div className="mt-4" style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                      <Legend verticalAlign="bottom" height={24} iconType="circle" />
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`slice-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {showCategoryPieChart && pieChartData.length === 0 && (
                <p className="text-xs text-gray-500 mt-3">No expenses available to generate chart.</p>
              )}

              {/* toggle button above replaces separate hide control*/} 
            </div>
          </div>

          {/* Table Filters & Log List */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-gray-700">Expense Log</h2>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <select className={inputFilter} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className={inputFilter} value={filterDateRange} onChange={e => setFilterDateRange(e.target.value)}>
                  <option value="All">All Time</option>
                  <option value="This Month">This Month</option>
                  <option value="Last Month">Last Month</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-175 w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b text-gray-600 text-sm font-semibold">
                    <th className="p-3">Date</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Note</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-700">
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-white transition">
                      <td className="p-3 whitespace-nowrap">{exp.date}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center">
                          <span className="inline-block w-2 h-2 mr-2 rounded-full" style={{ background: categoryColor(exp.category) }}></span>
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">{exp.category}</span>
                        </span>
                      </td>
                      <td className="p-3 font-semibold">₹{toAmount(exp).toFixed(2)}</td>
                      <td className="p-3 text-gray-500 max-w-xs truncate">{exp.note || "—"}</td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => { setEditingId(exp.id); setFormData({ amount: String(toAmount(exp)), category: exp.category, date: exp.date, note: exp.note || '' }); }} className="text-sm px-3 py-1 rounded-md bg-white border border-gray-200 hover:shadow">Edit</button>
                        <button onClick={() => handleDelete(exp.id)} className="text-sm px-3 py-1 rounded-md bg-white border border-red-200 text-red-600 hover:shadow">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">No expenses found matching the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/*function App() {
  return (
    <div className="bg-red-500 text-white text-4xl p-10">
      Tailwind Working
    </div>
  );
}

export default App;
*/