import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

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

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of the banking system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{data?.active_accounts || 0}</div>
          <div className="stat-label">Active Accounts</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-value">
            ${(data?.total_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Total Balance</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{data?.active_loans || 0}</div>
          <div className="stat-label">Active Loans</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">
            ${(data?.total_loan_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Total Loan Balance</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{data?.total_transactions || 0}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>System Information</h3>
          <button className="btn btn-outline btn-sm" onClick={loadDashboard}>Refresh</button>
        </div>
        <table>
          <tbody>
            <tr><td><strong>Backend</strong></td><td>GnuCOBOL 3.1</td></tr>
            <tr><td><strong>API</strong></td><td>Python Flask</td></tr>
            <tr><td><strong>Architecture</strong></td><td>COBOL Backend + REST API + React Frontend</td></tr>
            <tr><td><strong>Operations Supported</strong></td><td>15 banking operations</td></tr>
            <tr><td><strong>Max Accounts</strong></td><td>100</td></tr>
            <tr><td><strong>Max Loans</strong></td><td>50</td></tr>
            <tr><td><strong>Transaction Log</strong></td><td>500 entries</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
