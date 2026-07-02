import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PieChart,
  Target,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  Edit2,
  Download,
  Briefcase,
  Flag,
  CreditCard,
  Home,
  BarChart3,
  Calendar,
  Globe,
  User,
  Camera,
  Upload
} from 'lucide-react';
import api from './api/api';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  
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
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Load profile image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const error = params.get('error');

    if (error) {
      alert('Authentication failed: ' + error);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (tokenParam) {
      localStorage.setItem('token', tokenParam);
      setToken(tokenParam);
      window.history.replaceState({}, document.title, window.location.pathname);
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = transactions.filter(function(t) {
        return (
          (t.description && t.description.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query)) ||
          (t.type && t.type.toLowerCase().includes(query))
        );
      });
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, transactions]);

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
        setFilteredTransactions(result.data);
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

  // ===== PROFILE IMAGE HANDLERS =====
  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // ===== NAVIGATION HANDLERS =====
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
    // Show different content based on tab
    switch(tab) {
      case 'dashboard':
        break;
      case 'accounts':
        alert('Accounts page - Manage your bank accounts and credit cards');
        break;
      case 'transactions':
        alert('Transactions page - View all your transactions');
        break;
      case 'investments':
        alert('Investments page - Track your investment portfolio');
        break;
      case 'budgets':
        alert('Budgets page - Set and manage your budgets');
        break;
      case 'goals':
        alert('Goals page - Set and track your financial goals');
        break;
      case 'reports':
        alert('Reports page - Generate financial reports');
        break;
      case 'settings':
        alert('Settings page - Manage your account settings');
        break;
      case 'help':
        alert('Help & Support - Get help with your account');
        break;
      default:
        break;
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ===== SEARCH HANDLER =====
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // ===== NOTIFICATION HANDLER =====
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotificationCount(0);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const result = await api.login(loginEmail, loginPassword);
      if (result.success) {
        var newToken = result.data.token;
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

  const handleGoogleLogin = function() {
    window.location.href = (import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com') + '/auth/google';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setLoading(true);
    try {
      var result = await api.register({
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
        setTimeout(function() {
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

  const handleLogout = function() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setSummary(null);
    setTransactions([]);
    setCategoryTotals([]);
    setMonthlyTrends([]);
    setProfileImage(null);
    localStorage.removeItem('profileImage');
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login first');
      return;
    }
    setLoading(true);
    try {
      var result;
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
        alert(editingTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!');
      } else {
        alert(result.message || 'Error saving transaction');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleDeleteTransaction = async (id) => {
    if (!token) return;
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        var result = await api.deleteTransaction(token, id);
        if (result.success) {
          await fetchAllData();
          alert('Transaction deleted successfully!');
        } else {
          alert(result.message || 'Error deleting transaction');
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const openEditModal = function(transaction) {
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

  const openAddModal = function() {
    setEditingTransaction(null);
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  const closeModal = function() {
    setShowModal(false);
    setEditingTransaction(null);
  };

  // ===== EXPORT HANDLER =====
  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }
    // Create CSV content
    let csvContent = 'Date,Description,Category,Type,Amount\n';
    transactions.forEach(function(t) {
      csvContent += new Date(t.date).toLocaleDateString() + ',';
      csvContent += (t.description || '-') + ',';
      csvContent += t.category + ',';
      csvContent += t.type + ',';
      csvContent += t.amount + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Transactions exported successfully!');
  };

  // ===== CHART DATA =====
  var mockData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    income: [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000],
    expenses: [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500]
  };

  var barChartData = {
    labels: monthlyTrends.length > 0 ? monthlyTrends.map(function(m) { return m.month_name.substring(0, 3); }) : mockData.labels,
    datasets: [
      {
        label: 'Income',
        data: monthlyTrends.length > 0 ? monthlyTrends.map(function(m) { return m.total_income; }) : mockData.income,
        backgroundColor: 'rgba(0, 255, 136, 0.6)',
        borderColor: '#00ff88',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.6
      },
      {
        label: 'Expenses',
        data: monthlyTrends.length > 0 ? monthlyTrends.map(function(m) { return m.total_expenses; }) : mockData.expenses,
        backgroundColor: 'rgba(255, 51, 102, 0.6)',
        borderColor: '#ff3366',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.6
      }
    ]
  };

  var barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { 
          color: '#b0b8d4', 
          font: { size: 12, weight: '500' }, 
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    scales: {
      x: { 
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false }, 
        ticks: { color: '#7a8299', font: { size: 11 } } 
      },
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false }, 
        ticks: { color: '#7a8299', font: { size: 11 }, callback: function(v) { return '$' + v.toLocaleString(); } } 
      }
    }
  };

  var pieData = {
    labels: categoryTotals.length > 0 ? categoryTotals.map(function(c) { return c.category; }) : ['Stocks', 'Bonds', 'Real Estate', 'Cash'],
    datasets: [{
      data: categoryTotals.length > 0 ? categoryTotals.map(function(c) { return c.total_expenses; }) : [55, 20, 15, 10],
      backgroundColor: ['#00d9ff', '#0099ff', '#00ff88', '#ffaa00', '#ff3366', '#b0b8d4'],
      borderWidth: 2,
      borderColor: '#0a0e27'
    }]
  };

  var pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: '#b0b8d4', 
          font: { size: 11, weight: '500' }, 
          padding: 15, 
          usePointStyle: true, 
          pointStyle: 'circle' 
        }
      }
    },
    cutout: '70%'
  };

  // Mock transactions for display
  var mockTransactions = [
    { id: 1, name: 'Apple Inc.', symbol: 'AAPL • Stock', date: 'May 28, 2024', amount: 250.00, type: 'income', category: 'Stocks', status: 'Completed' },
    { id: 2, name: 'Starbucks', symbol: 'Dining • Expense', date: 'May 27, 2024', amount: 18.75, type: 'expense', category: 'Dining', status: 'Completed' },
    { id: 3, name: 'Salary Deposit', symbol: 'Income', date: 'May 26, 2024', amount: 8765.42, type: 'income', category: 'Income', status: 'Completed' },
  ];

  var displayTransactions = filteredTransactions.length > 0 ? filteredTransactions : mockTransactions;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading Finova...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="auth-tabs">
            <button 
              className={'tab-btn ' + (isLoginMode ? 'active' : '')} 
              onClick={function() { setIsLoginMode(true); }}
            >
              Login
            </button>
            <button 
              className={'tab-btn ' + (!isLoginMode ? 'active' : '')} 
              onClick={function() { setIsLoginMode(false); }}
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
                  onChange={function(e) { setLoginEmail(e.target.value); }} 
                  required 
                  placeholder="Enter your email" 
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={function(e) { setLoginPassword(e.target.value); }} 
                  required 
                  placeholder="Enter your password" 
                />
              </div>
              {loginError && <div className="error-message">{loginError}</div>}
              <button type="submit" className="btn">Login</button>
              <div className="or-divider"><span>OR</span></div>
              <button type="button" onClick={handleGoogleLogin} className="google-signin-btn">
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.87 7.35 2.56 10.56l7.97-6.97z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.97C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Sign in with Google
              </button>
              <p className="register-link">
                Don't have an account? <a href="#" onClick={function(e) { e.preventDefault(); setIsLoginMode(false); }}>Sign up</a>
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
                  onChange={function(e) { setRegisterName(e.target.value); }} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={registerEmail} 
                  onChange={function(e) { setRegisterEmail(e.target.value); }} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={registerPassword} 
                  onChange={function(e) { setRegisterPassword(e.target.value); }} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select 
                  value={registerRole} 
                  onChange={function(e) { setRegisterRole(e.target.value); }}
                >
                  <option value="3">Viewer</option>
                  <option value="2">Analyst</option>
                  <option value="1">Admin</option>
                </select>
              </div>
              {registerError && <div className="error-message">{registerError}</div>}
              {registerSuccess && <div className="success-message">{registerSuccess}</div>}
              <button type="submit" className="btn">Register</button>
              <p className="register-link">
                Already have an account? <a href="#" onClick={function(e) { e.preventDefault(); setIsLoginMode(true); }}>Login</a>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={function() { setSidebarOpen(false); }}></div>}

      {/* Sidebar */}
      <aside className={'sidebar ' + (sidebarOpen ? 'open' : '')}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon"><TrendingUp size={24} /></div>
            <span>Finova</span>
          </div>
          <button className="sidebar-close" onClick={function() { setSidebarOpen(false); }}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={'nav-item ' + (activeTab === 'dashboard' ? 'active' : '')} 
            onClick={function() { handleTabChange('dashboard'); }}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            className={'nav-item ' + (activeTab === 'accounts' ? 'active' : '')} 
            onClick={function() { handleTabChange('accounts'); }}
          >
            <Wallet size={20} /> Accounts
          </button>
          <button 
            className={'nav-item ' + (activeTab === 'transactions' ? 'active' : '')} 
            onClick={function() { handleTabChange('transactions'); }}
          >
            <TrendingUp size={20} /> Transactions
          </button>
          <button 
            className={'nav-item ' + (activeTab === 'investments' ? 'active' : '')} 
            onClick={function() { handleTabChange('investments'); }}
          >
            <Briefcase size={20} /> Investments
          </button>
          <button 
            className={'nav-item ' + (activeTab === 'budgets' ? 'active' : '')} 
            onClick={function() { handleTabChange('budgets'); }}
          >
            <Target size={20} /> Budgets
          </button>
          <button 
            className={'nav-item ' + (activeTab === 'goals' ? 'active' : '')} 
            onClick={function() { handleTabChange('goals'); }}
          >
            <Flag size={20} /> Goals
          </button>
          <button 
            className={'nav-item ' + (activeTab === 'reports' ? 'active' : '')} 
            onClick={function() { handleTabChange('reports'); }}
          >
            <FileText size={20} /> Reports
          </button>
          <button 
            className={'nav-item ' + (activeTab === 'settings' ? 'active' : '')} 
            onClick={function() { handleTabChange('settings'); }}
          >
            <Settings size={20} /> Settings
          </button>
          <button 
            className={'nav-item ' + (activeTab === 'help' ? 'active' : '')} 
            onClick={function() { handleTabChange('help'); }}
          >
            <HelpCircle size={20} /> Help & Support
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar-wrapper" onClick={triggerFileInput}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="user-avatar-img" />
              ) : (
                <div className="user-avatar">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AM'}
                </div>
              )}
              <div className="avatar-upload-overlay">
                <Camera size={16} />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'Alex Morgan'}</p>
              <p className="user-role">Premium Member</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <button className="menu-toggle" onClick={handleSidebarToggle}>
            <Menu size={24} />
          </button>
          <div className="header-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search transactions, accounts..." 
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={toggleNotifications}>
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>
            <button className="icon-btn" onClick={handleExport}>
              <Download size={20} />
            </button>
            <div className="header-user">
              <div className="user-avatar small">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="user-avatar-img-small" />
                ) : (
                  user?.name ? user.name.substring(0, 2).toUpperCase() : 'AM'
                )}
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-header">
            <h1>Overview</h1>
            <div className="page-actions">
              <button className="btn-outline" onClick={handleExport}>Export</button>
              <button className="btn-primary" onClick={openAddModal}>
                <Plus size={16} /> Add Transaction
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Balance</span>
                <span className="stat-badge success">+12.5%</span>
              </div>
              <div className="stat-value">${summary?.net_balance?.toLocaleString() || '124,567.89'}</div>
              <div className="stat-change positive">
                <ArrowUpRight size={16} /> 12.5% vs last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Monthly Income</span>
                <span className="stat-badge success">+8.2%</span>
              </div>
              <div className="stat-value income">${summary?.total_income?.toLocaleString() || '8,765.42'}</div>
              <div className="stat-change positive">
                <ArrowUpRight size={16} /> 8.2% vs last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Expenses</span>
                <span className="stat-badge danger">+3.4%</span>
              </div>
              <div className="stat-value expense">${summary?.total_expenses?.toLocaleString() || '3,456.78'}</div>
              <div className="stat-change negative">
                <ArrowDownRight size={16} /> 3.4% vs last month
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-section">
            <div className="chart-card portfolio-chart">
              <div className="chart-header">
                <h3>Portfolio Growth</h3>
                <div className="chart-controls">
                  <button className="chart-btn active" onClick={function() { alert('1D view selected'); }}>1D</button>
                  <button className="chart-btn" onClick={function() { alert('1W view selected'); }}>1W</button>
                  <button className="chart-btn" onClick={function() { alert('1M view selected'); }}>1M</button>
                  <button className="chart-btn" onClick={function() { alert('3M view selected'); }}>3M</button>
                  <button className="chart-btn" onClick={function() { alert('ALL view selected'); }}>ALL</button>
                </div>
              </div>
              <div className="chart-body">
                <Bar data={barChartData} options={barOptions} />
              </div>
            </div>

            <div className="chart-card">
              <h3>Asset Allocation</h3>
              <div className="chart-body pie-chart">
                <Pie data={pieData} options={pieOptions} />
                <div className="donut-center">
                  <span className="donut-label">Total</span>
                  <span className="donut-value">${summary?.net_balance?.toLocaleString() || '124,567'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="transactions-section">
            <div className="transactions-header">
              <h3>Recent Transactions</h3>
              <button className="view-all-btn" onClick={function() { handleTabChange('transactions'); }}>
                View All →
              </button>
            </div>

            <div className="table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Asset Allocation</th>
                    <th>Recent Transactions</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTransactions.slice(0, 4).map(function(t, index) {
                    var icons = ['Apple Inc.', 'Starbucks', 'Salary Deposit', 'Amazon'];
                    var icon = icons[index % icons.length];
                    var symbols = ['AAPL • Stock', 'Dining • Expense', 'Income', 'Retail • Expense'];
                    var symbol = symbols[index % symbols.length];
                    return (
                      <tr key={t.id || index}>
                        <td>
                          <div className="asset-info">
                            <span className="asset-name">{icon}</span>
                            <span className="asset-symbol">{symbol}</span>
                          </div>
                        </td>
                        <td className="transaction-desc">{t.description || t.category || 'Transaction'}</td>
                        <td className={'amount ' + t.type}>
                          {t.type === 'income' ? '+' : '-'}${Math.abs(parseFloat(t.amount)).toLocaleString()}
                        </td>
                        <td><span className="status-badge completed">Completed</span></td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn edit" 
                              onClick={function() { openEditModal(t); }}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="action-btn delete" 
                              onClick={function() { handleDeleteTransaction(t.id); }}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={function(e) { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitTransaction} className="modal-form">
              <div className="input-group">
                <label>Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.amount} 
                  onChange={function(e) { setFormData({ ...formData, amount: e.target.value }); }} 
                  required 
                  placeholder="0.00"
                />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select 
                  value={formData.type} 
                  onChange={function(e) { setFormData({ ...formData, type: e.target.value }); }} 
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
                  onChange={function(e) { setFormData({ ...formData, category: e.target.value }); }} 
                  required 
                  placeholder="e.g., Food, Rent, Salary"
                />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={function(e) { setFormData({ ...formData, date: e.target.value }); }} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={function(e) { setFormData({ ...formData, description: e.target.value }); }} 
                  rows="3" 
                  placeholder="Optional description"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingTransaction ? 'Update' : 'Save')}
                </button>
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
