import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import api from './api/api';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('3');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Check for Google auth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const error = params.get('error');

    if (error) {
      alert(`Authentication failed: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (tokenParam) {
      localStorage.setItem('token', tokenParam);
      setToken(tokenParam);
      window.history.replaceState({}, document.title, window.location.pathname);
      // Reload to trigger validation
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAllData();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTransactions();
      fetchDashboardData();
      fetchCategoryTotals();
    }
  }, [filterType, filterCategory, startDate, endDate, isAuthenticated, token]);

  const validateToken = async () => {
    setLoading(true);
    try {
      const result = await api.getMe(token);
      if (result.success) {
        setUser(result.data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchTransactions(),
      fetchCategoryTotals(),
      fetchMonthlyTrends()
    ]);
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const result = await api.getDashboardSummary(token, startDate, endDate);
      if (result.success) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    const filters = {};
    if (filterType) filters.type = filterType;
    if (filterCategory) filters.category = filterCategory;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    try {
      const result = await api.getTransactions(token, filters);
      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategoryTotals = async () => {
    if (!token) return;
    try {
      const result = await api.getCategoryTotals(token, startDate, endDate);
      if (result.success) {
        setCategoryTotals(result.data);
      }
    } catch (error) {
      console.error('Error fetching category totals:', error);
    }
  };

  const fetchMonthlyTrends = async () => {
    if (!token) return;
    try {
      const result = await api.getMonthlyTrends(token, new Date().getFullYear());
      if (result.success) {
        setMonthlyTrends(result.data);
      }
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    
    try {
      const result = await api.login(loginEmail, loginPassword);
      
      if (result.success) {
        const newToken = result.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(result.data);
        setIsAuthenticated(true);
      } else {
        setLoginError(result.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // ✅ Google Sign-In Handler
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com'}/auth/google`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setLoading(true);
    
    try {
      const result = await api.register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role_id: parseInt(registerRole)
      });
      
      if (result.success) {
        setRegisterSuccess('Account created successfully! Please login.');
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterRole('3');
        setTimeout(() => {
          setIsLoginMode(true);
          setRegisterSuccess('');
        }, 3000);
      } else {
        setRegisterError(result.message || 'Registration failed');
      }
    } catch (error) {
      setRegisterError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setSummary(null);
    setTransactions([]);
    setCategoryTotals([]);
    setMonthlyTrends([]);
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    let result;
    
    if (editingTransaction) {
      result = await api.updateTransaction(token, editingTransaction.id, formData);
    } else {
      result = await api.createTransaction(token, formData);
    }
    
    if (result.success) {
      setShowModal(false);
      setEditingTransaction(null);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      await fetchAllData();
    } else {
      alert(result.message || 'Error saving transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!token) return;
    
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const result = await api.deleteTransaction(token, id);
      if (result.success) {
        await fetchAllData();
      } else {
        alert(result.message || 'Error deleting transaction');
      }
    }
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date.split('T')[0],
      description: transaction.description || ''
    });
    setShowModal(true);
  };

  const barChartData = {
    labels: monthlyTrends.map(m => m.month_name.substring(0, 3)),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrends.map(m => m.total_income),
        backgroundColor: 'rgba(40, 167, 69, 0.6)',
        borderColor: '#28a745',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: monthlyTrends.map(m => m.total_expenses),
        backgroundColor: 'rgba(220, 53, 69, 0.6)',
        borderColor: '#dc3545',
        borderWidth: 1
      }
    ]
  };

  const pieChartData = {
    labels: categoryTotals.map(c => c.category),
    datasets: [
      {
        data: categoryTotals.map(c => c.total_expenses),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FFB6C1'
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="auth-tabs">
            <button 
              className={`tab-btn ${isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(true);
                setRegisterError('');
                setRegisterSuccess('');
                setLoginError('');
              }}
            >
              Login
            </button>
            <button 
              className={`tab-btn ${!isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(false);
                setLoginError('');
                setRegisterError('');
                setRegisterSuccess('');
              }}
            >
              Create Account
            </button>
          </div>

          {isLoginMode ? (
            <form onSubmit={handleLogin}>
              <h2>Welcome Back</h2>
              <p className="login-subtitle">Sign in to your account</p>
              
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              {loginError && <div className="error-message">{loginError}</div>}
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              
              {/* ✅ GOOGLE SIGN-IN DIVIDER */}
              <div className="or-divider">
                <span>OR</span>
              </div>
              
              {/* ✅ GOOGLE SIGN-IN BUTTON */}
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="google-signin-btn"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.87 7.35 2.56 10.56l7.97-6.97z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.97C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Sign in with Google
              </button>
              
              <p className="register-link">
                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginMode(false); }}>Sign up</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2>Create Account</h2>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value)}
                >
                  <option value="3">Viewer (Can only view)</option>
                  <option value="2">Analyst (Can view and create)</option>
                  <option value="1">Admin (Full access)</option>
                </select>
              </div>
              {registerError && <div className="error-message">{registerError}</div>}
              {registerSuccess && <div className="success-message">{registerSuccess}</div>}
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </button>
              <p className="register-link">
                Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginMode(true); }}>Login</a>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Finance Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <span>Role: {user?.role_name}</span>
          {user?.role_name === 'admin' && (
            <span className="admin-badge">Admin</span>
          )}
          <button onClick={handleLogout} className="btn logout-btn">Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <h3>Total Income</h3>
          <div className="value">${summary?.total_income?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card expense">
          <h3>Total Expenses</h3>
          <div className="value">${summary?.total_expenses?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card balance">
          <h3>Net Balance</h3>
          <div className="value">${summary?.net_balance?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Transactions</h3>
          <div className="value">{summary?.total_transactions || 0}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Trends</h3>
          <Bar data={barChartData} options={{ responsive: true }} />
        </div>
        <div className="chart-card">
          <h3>Expenses by Category</h3>
          {categoryTotals.length > 0 ? (
            <Pie data={pieChartData} options={{ responsive: true }} />
          ) : (
            <p>No expense data available</p>
          )}
        </div>
      </div>

      <div className="transactions-section">
        <div className="transactions-header">
          <h3>Transactions</h3>
          <button 
            onClick={() => setShowModal(true)} 
            style={{
              background: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Add Transaction
          </button>
        </div>

        <div className="filters">
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="text"
            className="filter-select"
            placeholder="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />
          <input
            type="date"
            className="filter-select"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="filter-select"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button onClick={() => {
            setFilterType('');
            setFilterCategory('');
            setStartDate('');
            setEndDate('');
          }} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>

        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.description || '-'}</td>
                <td>{transaction.category}</td>
                <td>
                  <span className={transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}>
                    {transaction.type}
                  </span>
                </td>
                <td className={transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}>
                  ${parseFloat(transaction.amount).toLocaleString()}
                </td>
                <td>
                  <button onClick={() => openEditModal(transaction)} className="btn edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTransaction(transaction.id)} className="btn delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <form onSubmit={handleSubmitTransaction}>
              <div className="input-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="input-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn">Save</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                    setFormData({
                      amount: '',
                      type: 'expense',
                      category: '',
                      date: new Date().toISOString().split('T')[0],
                      description: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
