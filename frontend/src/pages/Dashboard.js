import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const result = await api.getDashboard();
      setData(result);
    } catch (err) {
      setError('Failed to load dashboard data');
    }
    setLoading(false);
  }

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const fmt = (v) => (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Banking system overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-label">Active Accounts</div>
          <div className="stat-value">{data?.active_accounts || 0}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">${fmt(data?.total_balance)}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Active Loans</div>
          <div className="stat-value">{data?.active_loans || 0}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Total Loan Balance</div>
          <div className="stat-value">${fmt(data?.total_loan_balance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{data?.total_transactions || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>System Information</h3>
          <button className="btn btn-outline btn-sm" onClick={loadDashboard}>Refresh</button>
        </div>
        <div className="detail-row"><span className="detail-label">Backend</span><span className="detail-value">GnuCOBOL 3.1</span></div>
        <div className="detail-row"><span className="detail-label">API</span><span className="detail-value">Python Flask</span></div>
        <div className="detail-row"><span className="detail-label">Architecture</span><span className="detail-value">COBOL + REST API + React</span></div>
        <div className="detail-row"><span className="detail-label">Operations</span><span className="detail-value">15 banking operations</span></div>
        <div className="detail-row"><span className="detail-label">Max Accounts</span><span className="detail-value">100</span></div>
        <div className="detail-row"><span className="detail-label">Max Loans</span><span className="detail-value">50</span></div>
      </div>
    </div>
  );
}

export default Dashboard;
