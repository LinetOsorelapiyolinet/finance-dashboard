const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://finance-backend-api-74z9.onrender.com';

const api = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  getMe: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getTransactions: async (token, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/api/transactions${params ? `?${params}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  createTransaction: async (token, transaction) => {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: parseFloat(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        description: transaction.description || ''
      })
    });
    return response.json();
  },

  updateTransaction: async (token, id, transaction) => {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: parseFloat(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        description: transaction.description || ''
      })
    });
    return response.json();
  },

  deleteTransaction: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getDashboardSummary: async (token, startDate, endDate) => {
    let url = `${API_BASE_URL}/api/dashboard/summary`;
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getCategoryTotals: async (token, startDate, endDate) => {
    let url = `${API_BASE_URL}/api/dashboard/category-totals`;
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getMonthlyTrends: async (token, year) => {
    const url = `${API_BASE_URL}/api/dashboard/monthly-trends${year ? `?year=${year}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getCompleteDashboard: async (token, startDate, endDate, year) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (year) params.append('year', year);
    const url = `${API_BASE_URL}/api/dashboard/complete${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

export default api;
