const API_BASE = process.env.REACT_APP_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  const res = await fetch(url, config);
  const data = await res.json();
  return data;
}

export const api = {
  health: () => request('/health'),

  getAccounts: () => request('/accounts'),
  createAccount: (data) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  getAccount: (id) => request(`/accounts/${id}`),
  updateAccount: (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),

  deposit: (id, amount) => request(`/accounts/${id}/deposit`, { method: 'POST', body: JSON.stringify({ amount }) }),
  withdraw: (id, amount) => request(`/accounts/${id}/withdraw`, { method: 'POST', body: JSON.stringify({ amount }) }),
  transfer: (from, to, amount) => request('/transfer', { method: 'POST', body: JSON.stringify({ from_account: from, to_account: to, amount }) }),

  getLoans: (accountId) => request(`/loans${accountId ? `?account_id=${accountId}` : ''}`),
  createLoan: (data) => request('/loans', { method: 'POST', body: JSON.stringify(data) }),
  getLoan: (id) => request(`/loans/${id}`),
  payLoan: (loanId, accountId, amount) => request(`/loans/${loanId}/pay`, { method: 'POST', body: JSON.stringify({ account_id: accountId, amount }) }),

  getCreditScore: (id, name, income, debt) => request(`/accounts/${id}/score?name=${encodeURIComponent(name)}&income=${income}&debt=${debt}`),
  getTransactions: (id) => request(`/accounts/${id}/transactions`),
  getDashboard: () => request('/dashboard'),

  batch: (operations) => request('/batch', { method: 'POST', body: JSON.stringify({ operations }) }),
};
