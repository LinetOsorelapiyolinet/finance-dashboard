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
  Moon,
  Sun,
  Monitor,
  Shield,
  Mail,
  Camera,
  Users,
  BookOpen,
  MessageCircle,
  Video,
  Save,
  CheckCircle,
  CreditCard,
  BarChart3,
  PieChart,
  Landmark,
  PiggyBank,
  Coins,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  Building2
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
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    theme: 'dark',
    accentColor: 'cyan',
    fontSize: 'medium',
    compactView: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    shareAnalytics: false,
    publicProfile: false
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('dark');
  
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [accountFormData, setAccountFormData] = useState({
    name: '',
    type: 'Checking',
    balance: 0
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === 'light') {
      body.style.backgroundColor = '#f0f2f5';
      body.style.color = '#1a1a2e';
      root.style.setProperty('--bg-primary', '#f0f2f5');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--text-primary', '#1a1a2e');
      root.style.setProperty('--text-secondary', '#4a4a6a');
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.08)');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
      return;
    } else {
      body.style.backgroundColor = '#0a0e27';
      body.style.color = '#ffffff';
      root.style.setProperty('--bg-primary', '#0a0e27');
      root.style.setProperty('--bg-secondary', '#141829');
      root.style.setProperty('--bg-card', 'rgba(20, 24, 41, 0.6)');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#b0b8d4');
      root.style.setProperty('--border-color', 'rgba(0, 217, 255, 0.06)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.4)');
    }
    
    setThemeApplied(true);
    setCurrentTheme(theme);
  };

  useEffect(() => {
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = function(e) {
        applyTheme('system');
      };
      mediaQuery.addEventListener('change', handler);
      return function() { mediaQuery.removeEventListener('change', handler); };
    }
  }, [settings.theme]);

  const loadSettings = async function() {
    if (!token) return;
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com') + '/api/settings', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        setCurrentTheme(result.data.theme || 'dark');
        applyTheme(result.data.theme || 'dark');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadAuditLogs = async function() {
    if (!token) return;
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com') + '/api/audit-logs', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const result = await response.json();
      if (result.success) {
        setAuditLogs(result.data);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const loadAccounts = async function() {
    if (!token) return;
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com') + '/api/accounts', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const result = await response.json();
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  useEffect(function() {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  useEffect(function() {
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

  useEffect(function() {
    if (token) {
      validateToken();
      loadSettings();
      loadAuditLogs();
      loadAccounts();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, [token]);

  useEffect(function() {
    if (isAuthenticated && token) {
      fetchAllData();
    }
  }, [isAuthenticated, token]);

  useEffect(function() {
    if (isAuthenticated && token) {
      fetchTransactions();
      fetchDashboardData();
      fetchCategoryTotals();
    }
  }, [filterType, filterCategory, startDate, endDate, isAuthenticated, token]);

  useEffect(function() {
    if (searchQuery.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      var query = searchQuery.toLowerCase();
      var filtered = transactions.filter(function(t) {
        return (
          (t.description && t.description.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query)) ||
          (t.type && t.type.toLowerCase().includes(query))
        );
      });
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, transactions]);

  const validateToken = async function() {
    setLoading(true);
    try {
      var result = await api.getMe(token);
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

  const fetchAllData = async function() {
    await Promise.all([
      fetchDashboardData(),
      fetchTransactions(),
      fetchCategoryTotals(),
      fetchMonthlyTrends()
    ]);
  };

  const fetchDashboardData = async function() {
    if (!token) return;
    try {
      var result = await api.getDashboardSummary(token, startDate, endDate);
      if (result.success) {
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchTransactions = async function() {
    if (!token) return;
    var filters = {};
    if (filterType) filters.type = filterType;
    if (filterCategory) filters.category = filterCategory;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    try {
      var result = await api.getTransactions(token, filters);
      if (result.success) {
        setTransactions(result.data);
        setFilteredTransactions(result.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategoryTotals = async function() {
    if (!token) return;
    try {
      var result = await api.getCategoryTotals(token, startDate, endDate);
      if (result.success) {
        setCategoryTotals(result.data);
      }
    } catch (error) {
      console.error('Error fetching category totals:', error);
    }
  };

  const fetchMonthlyTrends = async function() {
    if (!token) return;
    try {
      var result = await api.getMonthlyTrends(token, new Date().getFullYear());
      if (result.success) {
        setMonthlyTrends(result.data);
      }
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
    }
  };

  const handleProfileImageUpload = function(event) {
    var file = event.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onloadend = function() {
        var imageData = reader.result;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = function() {
    fileInputRef.current.click();
  };

  const handleSettingChange = function(key, value) {
    var newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSettingsSaved(false);
    if (key === 'theme') {
      applyTheme(value);
    }
  };

  const saveSettings = async function() {
    setSettingsLoading(true);
    try {
      var response = await fetch((import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com') + '/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(settings)
      });
      var result = await response.json();
      if (result.success) {
        setSettingsSaved(true);
        setTimeout(function() { setSettingsSaved(false); }, 3000);
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings: ' + result.message);
      }
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    }
    setSettingsLoading(false);
  };

  const handleTabChange = function(tab) {
    setActiveTab(tab);
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSidebarToggle = function() {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = function(e) {
    setSearchQuery(e.target.value);
  };

  const handleLogin = async function(e) {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      var result = await api.login(loginEmail, loginPassword);
      if (result.success) {
        var newToken = result.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(result.data);
        setIsAuthenticated(true);
      } else {
        if (result.message && result.message.includes('admin')) {
          try {
            const adminResponse = await fetch((import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com') + '/api/auth/admin-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const adminResult = await adminResponse.json();
            if (adminResult.success) {
              var newToken = adminResult.data.token;
              localStorage.setItem('token', newToken);
              setToken(newToken);
              setUser(adminResult.data);
              setIsAuthenticated(true);
              return;
            }
          } catch (adminError) {
            console.error('Admin login error:', adminError);
          }
        }
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

  const handleRegister = async function(e) {
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
    setAccounts([]);
    setProfileImage(null);
    localStorage.removeItem('profileImage');
  };

  const handleSubmitTransaction = async function(e) {
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

  const handleDeleteTransaction = async function(id) {
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

  const openAddAccountModal = function() {
    setEditingAccount(null);
    setAccountFormData({
      name: '',
      type: 'Checking',
      balance: 0
    });
    setShowAccountModal(true);
  };

  const openEditAccountModal = function(account) {
    setEditingAccount(account);
    setAccountFormData({
      name: account.name,
      type: account.type,
      balance: account.balance
    });
    setShowAccountModal(true);
  };

  const closeAccountModal = function() {
    setShowAccountModal(false);
    setEditingAccount(null);
  };

  const handleSubmitAccount = async function(e) {
    e.preventDefault();
    if (!token) {
      alert('Please login first');
      return;
    }
    setLoading(true);
    try {
      var url = (import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com') + '/api/accounts';
      var method = 'POST';
      
      if (editingAccount) {
        url = url + '/' + editingAccount.id;
        method = 'PUT';
      }
      
      var response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(accountFormData)
      });
      var result = await response.json();
      
      if (result.success) {
        setShowAccountModal(false);
        setEditingAccount(null);
        setAccountFormData({
          name: '',
          type: 'Checking',
          balance: 0
        });
        await loadAccounts();
        alert(editingAccount ? 'Account updated successfully!' : 'Account added successfully!');
      } else {
        alert(result.message || 'Error saving account');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async function(id) {
    if (!token) return;
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        var response = await fetch((import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com') + '/api/accounts/' + id, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        var result = await response.json();
        if (result.success) {
          await loadAccounts();
          alert('Account deleted successfully!');
        } else {
          alert(result.message || 'Error deleting account');
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleExport = function() {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }
    var csvContent = 'Date,Description,Category,Type,Amount\n';
    transactions.forEach(function(t) {
      csvContent += new Date(t.date).toLocaleDateString() + ',';
      csvContent += (t.description || '-') + ',';
      csvContent += t.category + ',';
      csvContent += t.type + ',';
      csvContent += t.amount + '\n';
    });
    
    var blob = new Blob([csvContent], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Transactions exported successfully!');
  };

  var barChartData = {
    labels: monthlyTrends.length > 0 ? monthlyTrends.map(function(m) { return m.month_name.substring(0, 3); }) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: monthlyTrends.length > 0 ? monthlyTrends.map(function(m) { return m.total_income; }) : [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000],
        backgroundColor: 'rgba(0, 255, 136, 0.6)',
        borderColor: '#00ff88',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.6
      },
      {
        label: 'Expenses',
        data: monthlyTrends.length > 0 ? monthlyTrends.map(function(m) { return m.total_expenses; }) : [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500],
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

  var mockTransactions = [
    { id: 1, amount: 250.00, type: 'income', category: 'Stocks', date: '2024-05-28', description: 'Apple Inc. investment' },
    { id: 2, amount: 18.75, type: 'expense', category: 'Dining', date: '2024-05-27', description: 'Starbucks coffee' },
    { id: 3, amount: 8765.42, type: 'income', category: 'Salary', date: '2024-05-26', description: 'Monthly salary deposit' },
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
    <div className="dashboard-container" style={{ 
      backgroundColor: currentTheme === 'light' ? '#f0f2f5' : '#0a0e27',
      color: currentTheme === 'light' ? '#1a1a2e' : '#ffffff'
    }}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={function() { setSidebarOpen(false); }}></div>}

      <aside className={'sidebar ' + (sidebarOpen ? 'open' : '')} style={{
        backgroundColor: currentTheme === 'light' ? '#ffffff' : 'rgba(10, 14, 39, 0.95)',
        borderRight: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
      }}>
        <div className="sidebar-header" style={{
          borderBottom: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
        }}>
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

        <div className="sidebar-footer" style={{
          borderTop: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
        }}>
          <div className="user-card" style={{
            backgroundColor: currentTheme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)'
          }}>
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
              <p className="user-name" style={{ color: currentTheme === 'light' ? '#1a1a2e' : '#ffffff' }}>
                {user?.name || 'Alex Morgan'}
              </p>
              <p className="user-role">Premium Member</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header" style={{
          backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 14, 39, 0.8)',
          borderBottom: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
        }}>
          <button className="menu-toggle" onClick={handleSidebarToggle}>
            <Menu size={24} />
          </button>
          <div className="header-search" style={{
            backgroundColor: currentTheme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)',
            border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
          }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search transactions, accounts..." 
              value={searchQuery}
              onChange={handleSearch}
              style={{ color: currentTheme === 'light' ? '#1a1a2e' : '#ffffff' }}
            />
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={function() { alert('Notifications'); }}>
              <Bell size={20} />
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
          {activeTab === 'dashboard' && (
            <>
              <div className="page-header">
                <h1>Overview</h1>
                <div className="page-actions">
                  <button className="btn-outline" onClick={handleExport}>Export</button>
                  <button className="btn-primary" onClick={openAddModal}>
                    <Plus size={16} /> Add Transaction
                  </button>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="stat-header">
                    <span className="stat-label">Total Balance</span>
                    <span className="stat-badge success">+12.5%</span>
                  </div>
                  <div className="stat-value" style={{ color: currentTheme === 'light' ? '#1a1a2e' : '#ffffff' }}>
                    ${summary?.net_balance?.toLocaleString() || '124,567.89'}
                  </div>
                  <div className="stat-change positive">
                    <ArrowUpRight size={16} /> 12.5% vs last month
                  </div>
                </div>

                <div className="stat-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="stat-header">
                    <span className="stat-label">Monthly Income</span>
                    <span className="stat-badge success">+8.2%</span>
                  </div>
                  <div className="stat-value income">${summary?.total_income?.toLocaleString() || '8,765.42'}</div>
                  <div className="stat-change positive">
                    <ArrowUpRight size={16} /> 8.2% vs last month
                  </div>
                </div>

                <div className="stat-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
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

              <div className="charts-section">
                <div className="chart-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="chart-header">
                    <h3>Portfolio Growth</h3>
                    <div className="chart-controls">
                      <button className="chart-btn active" onClick={function() { alert('1D view'); }}>1D</button>
                      <button className="chart-btn" onClick={function() { alert('1W view'); }}>1W</button>
                      <button className="chart-btn" onClick={function() { alert('1M view'); }}>1M</button>
                      <button className="chart-btn" onClick={function() { alert('3M view'); }}>3M</button>
                      <button className="chart-btn" onClick={function() { alert('ALL view'); }}>ALL</button>
                    </div>
                  </div>
                  <div className="chart-body">
                    <Bar data={barChartData} options={barOptions} />
                  </div>
                </div>

                <div className="chart-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
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

              <div className="transactions-section" style={{
                backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
              }}>
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
            </>
          )}

          {activeTab === 'accounts' && (
            <div className="accounts-page">
              <div className="page-header">
                <h1>Accounts</h1>
                <button className="btn-primary" onClick={openAddAccountModal}>
                  <Plus size={16} /> Add Account
                </button>
              </div>
              <div className="accounts-grid">
                {accounts.length > 0 ? accounts.map(function(acc) {
                  return (
                    <div key={acc.id} className="account-card" style={{
                      backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                      border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                    }}>
                      <div className="account-icon"><Wallet size={24} /></div>
                      <div className="account-info">
                        <h3>{acc.name}</h3>
                        <p className="account-balance">${acc.balance?.toLocaleString() || '0.00'}</p>
                        <span className="account-type">{acc.type}</span>
                      </div>
                      <div className="account-actions">
                        <button className="account-btn" onClick={function() { openEditAccountModal(acc); }}>Edit</button>
                        <button className="account-btn delete" onClick={function() { handleDeleteAccount(acc.id); }}>Delete</button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="no-data" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
                    <p style={{ color: '#7a8299', fontSize: '16px' }}>No accounts found. Add your first account!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="transactions-page">
              <div className="page-header">
                <h1>All Transactions</h1>
                <button className="btn-primary" onClick={openAddModal}>
                  <Plus size={16} /> Add Transaction
                </button>
              </div>
              <div className="transactions-filters">
                <select 
                  className="filter-select" 
                  value={filterType} 
                  onChange={function(e) { setFilterType(e.target.value); }}
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input 
                  type="text" 
                  className="filter-select" 
                  placeholder="Category" 
                  value={filterCategory} 
                  onChange={function(e) { setFilterCategory(e.target.value); }}
                />
                <input 
                  type="date" 
                  className="filter-select" 
                  value={startDate} 
                  onChange={function(e) { setStartDate(e.target.value); }}
                />
                <input 
                  type="date" 
                  className="filter-select" 
                  value={endDate} 
                  onChange={function(e) { setEndDate(e.target.value); }}
                />
                <button className="btn-clear" onClick={function() { 
                  setFilterType(''); 
                  setFilterCategory(''); 
                  setStartDate(''); 
                  setEndDate(''); 
                }}>
                  Clear
                </button>
              </div>
              <div className="table-wrapper">
                <table className="transactions-table full-width">
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
                    {displayTransactions.map(function(t) {
                      return (
                        <tr key={t.id}>
                          <td>{new Date(t.date).toLocaleDateString()}</td>
                          <td className="desc">{t.description || '-'}</td>
                          <td><span className="category-tag">{t.category}</span></td>
                          <td>
                            <span className={'type-badge ' + t.type}>
                              {t.type}
                            </span>
                          </td>
                          <td className={'amount ' + t.type}>
                            {t.type === 'income' ? '+' : '-'}${Math.abs(parseFloat(t.amount)).toLocaleString()}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={function() { openEditModal(t); }} className="action-btn edit">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={function() { handleDeleteTransaction(t.id); }} className="action-btn delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {displayTransactions.length === 0 && (
                      <tr><td colSpan="6" className="no-data">No transactions found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <div className="investments-page">
              <div className="page-header">
                <h1>Investments</h1>
                <button className="btn-primary" onClick={function() { alert('Add investment'); }}>
                  <Plus size={16} /> Add Investment
                </button>
              </div>
              <div className="investments-grid">
                <div className="investment-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="investment-header">
                    <span className="investment-name">Apple Inc.</span>
                    <span className="investment-ticker">AAPL</span>
                  </div>
                  <div className="investment-details">
                    <div className="investment-value">$68,512.34</div>
                    <div className="investment-change positive">+12.5%</div>
                  </div>
                  <div className="investment-info">
                    <span>55% of portfolio</span>
                    <span className="investment-status">Stock</span>
                  </div>
                </div>
                <div className="investment-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="investment-header">
                    <span className="investment-name">Vanguard Bonds</span>
                    <span className="investment-ticker">VBT</span>
                  </div>
                  <div className="investment-details">
                    <div className="investment-value">$24,913.22</div>
                    <div className="investment-change positive">+3.2%</div>
                  </div>
                  <div className="investment-info">
                    <span>20% of portfolio</span>
                    <span className="investment-status">Bond</span>
                  </div>
                </div>
                <div className="investment-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="investment-header">
                    <span className="investment-name">Real Estate Fund</span>
                    <span className="investment-ticker">REF</span>
                  </div>
                  <div className="investment-details">
                    <div className="investment-value">$18,691.18</div>
                    <div className="investment-change positive">+5.7%</div>
                  </div>
                  <div className="investment-info">
                    <span>15% of portfolio</span>
                    <span className="investment-status">Real Estate</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budgets' && (
            <div className="budgets-page">
              <div className="page-header">
                <h1>Budgets</h1>
                <button className="btn-primary" onClick={function() { alert('Create budget'); }}>
                  <Plus size={16} /> Create Budget
                </button>
              </div>
              <div className="budgets-grid">
                <div className="budget-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="budget-header">
                    <h3>Food</h3>
                    <span className="budget-spent">$1,200 / $1,500</span>
                  </div>
                  <div className="budget-bar">
                    <div className="budget-fill" style={{ width: '80%' }}></div>
                  </div>
                  <div className="budget-remaining">Remaining: $300</div>
                </div>
                <div className="budget-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="budget-header">
                    <h3>Utilities</h3>
                    <span className="budget-spent">$400 / $500</span>
                  </div>
                  <div className="budget-bar">
                    <div className="budget-fill" style={{ width: '80%' }}></div>
                  </div>
                  <div className="budget-remaining">Remaining: $100</div>
                </div>
                <div className="budget-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="budget-header">
                    <h3>Entertainment</h3>
                    <span className="budget-spent">$250 / $400</span>
                  </div>
                  <div className="budget-bar">
                    <div className="budget-fill" style={{ width: '62%' }}></div>
                  </div>
                  <div className="budget-remaining">Remaining: $150</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="goals-page">
              <div className="page-header">
                <h1>Financial Goals</h1>
                <button className="btn-primary" onClick={function() { alert('Set goal'); }}>
                  <Plus size={16} /> Set Goal
                </button>
              </div>
              <div className="goals-grid">
                <div className="goal-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="goal-header">
                    <h3>Emergency Fund</h3>
                    <span className="goal-target">$10,000</span>
                  </div>
                  <div className="goal-progress">
                    <div className="goal-fill" style={{ width: '75%' }}></div>
                  </div>
                  <div className="goal-details">
                    <span>$7,500 saved</span>
                    <span className="goal-status">On track</span>
                  </div>
                </div>
                <div className="goal-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="goal-header">
                    <h3>Vacation Fund</h3>
                    <span className="goal-target">$5,000</span>
                  </div>
                  <div className="goal-progress">
                    <div className="goal-fill" style={{ width: '40%' }}></div>
                  </div>
                  <div className="goal-details">
                    <span>$2,000 saved</span>
                    <span className="goal-status">In progress</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-page">
              <div className="page-header">
                <h1>Reports</h1>
                <div className="page-actions">
                  <button className="btn-outline" onClick={handleExport}>Export CSV</button>
                  <button className="btn-primary" onClick={function() { alert('Generate report'); }}>Generate Report</button>
                </div>
              </div>
              <div className="reports-grid">
                <div className="report-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="report-icon"><FileText size={24} /></div>
                  <div className="report-info">
                    <h3>Monthly Summary</h3>
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                  <button className="report-btn" onClick={function() { alert('Download report'); }}>Download</button>
                </div>
                <div className="report-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="report-icon"><BarChart3 size={24} /></div>
                  <div className="report-info">
                    <h3>Yearly Trends</h3>
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                  <button className="report-btn" onClick={function() { alert('Download report'); }}>Download</button>
                </div>
                <div className="report-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="report-icon"><PieChart size={24} /></div>
                  <div className="report-info">
                    <h3>Category Breakdown</h3>
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                  <button className="report-btn" onClick={function() { alert('Download report'); }}>Download</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-page">
              <div className="settings-header">
                <h2>Settings</h2>
                <p className="settings-subtitle">Manage your account preferences and security</p>
              </div>

              <div className="settings-grid">
                <div className="settings-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="settings-card-header">
                    <div className="settings-icon"><Monitor size={20} /></div>
                    <h3>Appearance</h3>
                  </div>
                  <div className="settings-group">
                    <label>Theme</label>
                    <div className="theme-options">
                      <button 
                        className={'theme-btn ' + (settings.theme === 'dark' ? 'active' : '')}
                        onClick={function() { handleSettingChange('theme', 'dark'); }}
                      >
                        <Moon size={18} /> Dark
                      </button>
                      <button 
                        className={'theme-btn ' + (settings.theme === 'light' ? 'active' : '')}
                        onClick={function() { handleSettingChange('theme', 'light'); }}
                      >
                        <Sun size={18} /> Light
                      </button>
                      <button 
                        className={'theme-btn ' + (settings.theme === 'system' ? 'active' : '')}
                        onClick={function() { handleSettingChange('theme', 'system'); }}
                      >
                        <Monitor size={18} /> System
                      </button>
                    </div>
                  </div>
                  <div className="settings-group">
                    <label>Accent Color</label>
                    <div className="color-options">
                      {['cyan', 'blue', 'green', 'pink', 'purple', 'orange'].map(function(color) {
                        var colorMap = {
                          'cyan': '#00d9ff',
                          'blue': '#0099ff',
                          'green': '#00ff88',
                          'pink': '#ff3366',
                          'purple': '#9966ff',
                          'orange': '#ffaa00'
                        };
                        return (
                          <button 
                            key={color}
                            className={'color-btn ' + (settings.accentColor === color ? 'active' : '')}
                            style={{ background: colorMap[color] }}
                            onClick={function() { handleSettingChange('accentColor', color); }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="settings-group">
                    <label className="toggle-label">
                      <span>Compact View</span>
                      <div className="toggle-switch" onClick={function() { handleSettingChange('compactView', !settings.compactView); }}>
                        <div className={'toggle-slider ' + (settings.compactView ? 'active' : '')}></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="settings-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="settings-card-header">
                    <div className="settings-icon"><Bell size={20} /></div>
                    <h3>Notifications</h3>
                  </div>
                  <div className="settings-group">
                    <label className="toggle-label">
                      <span>Email Notifications</span>
                      <div className="toggle-switch" onClick={function() { handleSettingChange('emailNotifications', !settings.emailNotifications); }}>
                        <div className={'toggle-slider ' + (settings.emailNotifications ? 'active' : '')}></div>
                      </div>
                    </label>
                  </div>
                  <div className="settings-group">
                    <label className="toggle-label">
                      <span>Push Notifications</span>
                      <div className="toggle-switch" onClick={function() { handleSettingChange('pushNotifications', !settings.pushNotifications); }}>
                        <div className={'toggle-slider ' + (settings.pushNotifications ? 'active' : '')}></div>
                      </div>
                    </label>
                  </div>
                  <div className="settings-group">
                    <label className="toggle-label">
                      <span>Weekly Reports</span>
                      <div className="toggle-switch" onClick={function() { handleSettingChange('weeklyReports', !settings.weeklyReports); }}>
                        <div className={'toggle-slider ' + (settings.weeklyReports ? 'active' : '')}></div>
                      </div>
                    </label>
                  </div>
                  <div className="settings-group">
                    <label className="toggle-label">
                      <span>Monthly Reports</span>
                      <div className="toggle-switch" onClick={function() { handleSettingChange('monthlyReports', !settings.monthlyReports); }}>
                        <div className={'toggle-slider ' + (settings.monthlyReports ? 'active' : '')}></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="settings-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="settings-card-header">
                    <div className="settings-icon"><Shield size={20} /></div>
                    <h3>Security</h3>
                  </div>
                  <div className="settings-group">
                    <label className="toggle-label">
                      <span>Two-Factor Authentication</span>
                      <div className="toggle-switch" onClick={function() { handleSettingChange('twoFactorAuth', !settings.twoFactorAuth); }}>
                        <div className={'toggle-slider ' + (settings.twoFactorAuth ? 'active' : '')}></div>
                      </div>
                    </label>
                  </div>
                  <div className="settings-group">
                    <label>Session Timeout (minutes)</label>
                    <input 
                      type="number" 
                      value={settings.sessionTimeout} 
                      onChange={function(e) { handleSettingChange('sessionTimeout', parseInt(e.target.value) || 30); }}
                      className="settings-input"
                      min="5"
                      max="120"
                    />
                  </div>
                </div>

                <div className="settings-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="settings-card-header">
                    <div className="settings-icon"><Users size={20} /></div>
                    <h3>Privacy</h3>
                  </div>
                  <div className="settings-group">
                    <label className="toggle-label">
                      <span>Share Analytics</span>
                      <div className="toggle-switch" onClick={function() { handleSettingChange('shareAnalytics', !settings.shareAnalytics); }}>
                        <div className={'toggle-slider ' + (settings.shareAnalytics ? 'active' : '')}></div>
                      </div>
                    </label>
                  </div>
                  <div className="settings-group">
                    <label className="toggle-label">
                      <span>Public Profile</span>
                      <div className="toggle-switch" onClick={function() { handleSettingChange('publicProfile', !settings.publicProfile); }}>
                        <div className={'toggle-slider ' + (settings.publicProfile ? 'active' : '')}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-actions">
                <button 
                  className="btn-primary" 
                  onClick={saveSettings} 
                  disabled={settingsLoading}
                  style={{
                    backgroundColor: settingsLoading ? '#666' : undefined,
                    cursor: settingsLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {settingsLoading ? (
                    <span>Saving...</span>
                  ) : (
                    <span><Save size={16} /> Save Settings</span>
                  )}
                </button>
                {settingsSaved && (
                  <span className="settings-saved">
                    <CheckCircle size={16} /> Settings saved!
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="help-page">
              <div className="page-header">
                <h1>Help & Support</h1>
              </div>
              <p className="help-subtitle">How can we help you today?</p>
              <div className="help-grid">
                <div className="help-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="help-icon"><BookOpen size={24} /></div>
                  <h3>Documentation</h3>
                  <p>Read our comprehensive documentation to get started</p>
                  <button className="help-btn" onClick={function() { alert('Opening documentation...'); }}>View Docs</button>
                </div>
                <div className="help-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="help-icon"><MessageCircle size={24} /></div>
                  <h3>Live Chat</h3>
                  <p>Chat with our support team for immediate assistance</p>
                  <button className="help-btn" onClick={function() { alert('Starting live chat...'); }}>Start Chat</button>
                </div>
                <div className="help-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="help-icon"><Mail size={24} /></div>
                  <h3>Email Support</h3>
                  <p>Send us an email and we'll get back to you within 24 hours</p>
                  <button className="help-btn" onClick={function() { alert('Opening email support...'); }}>Send Email</button>
                </div>
                <div className="help-card" style={{
                  backgroundColor: currentTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 24, 41, 0.6)',
                  border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.06)'
                }}>
                  <div className="help-icon"><Video size={24} /></div>
                  <h3>Video Tutorials</h3>
                  <p>Watch step-by-step video tutorials on using Finova</p>
                  <button className="help-btn" onClick={function() { alert('Opening video tutorials...'); }}>Watch Videos</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={function(e) { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal" style={{
            backgroundColor: currentTheme === 'light' ? '#ffffff' : '#141829',
            border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.15)'
          }}>
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

      {showAccountModal && (
        <div className="modal-overlay" onClick={function(e) { if (e.target === e.currentTarget) closeAccountModal(); }}>
          <div className="modal" style={{
            backgroundColor: currentTheme === 'light' ? '#ffffff' : '#141829',
            border: currentTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(0, 217, 255, 0.15)'
          }}>
            <div className="modal-header">
              <h3>{editingAccount ? 'Edit Account' : 'Add New Account'}</h3>
              <button className="modal-close" onClick={closeAccountModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitAccount} className="modal-form">
              <div className="input-group">
                <label>Account Name</label>
                <input 
                  type="text" 
                  value={accountFormData.name} 
                  onChange={function(e) { setAccountFormData({ ...accountFormData, name: e.target.value }); }} 
                  required 
                  placeholder="e.g., Main Account, Savings, etc."
                />
              </div>
              <div className="input-group">
                <label>Account Type</label>
                <select 
                  value={accountFormData.type} 
                  onChange={function(e) { setAccountFormData({ ...accountFormData, type: e.target.value }); }}
                  required
                >
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Investment">Investment</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div className="input-group">
                <label>Starting Balance ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={accountFormData.balance} 
                  onChange={function(e) { setAccountFormData({ ...accountFormData, balance: parseFloat(e.target.value) || 0 }); }} 
                  required 
                  placeholder="0.00"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingAccount ? 'Update Account' : 'Add Account')}
                </button>
                <button type="button" className="btn-secondary" onClick={closeAccountModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
