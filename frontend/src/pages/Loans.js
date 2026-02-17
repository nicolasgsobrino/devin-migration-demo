import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

function CreateLoanModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ account_id: '', loan_id: '', principal: '', rate: '5.00', term_months: '12' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await api.createLoan(form);
      if (result.status === 'OK') {
        onCreated(result);
        onClose();
      } else {
        setError(result.message || 'Failed to create loan');
      }
    } catch (err) {
      setError('Network error');
    }
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Create New Loan</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Account ID</label>
              <input required placeholder="e.g. ACC001" value={form.account_id} onChange={e => setForm({...form, account_id: e.target.value.toUpperCase()})} />
            </div>
            <div className="form-group">
              <label>Loan ID</label>
              <input required placeholder="e.g. LOAN003" maxLength={8} value={form.loan_id} onChange={e => setForm({...form, loan_id: e.target.value.toUpperCase()})} />
            </div>
          </div>
          <div className="form-group">
            <label>Principal Amount</label>
            <input required type="number" step="0.01" min="100" placeholder="10000.00" value={form.principal} onChange={e => setForm({...form, principal: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Annual Interest Rate (%)</label>
              <input required type="number" step="0.01" min="0.01" max="30" value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Term (months)</label>
              <input required type="number" min="1" max="360" value={form.term_months} onChange={e => setForm({...form, term_months: e.target.value})} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Loan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PayLoanModal({ loan, onClose, onPaid }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await api.payLoan(loan.loan_id, loan.account_id, amount);
      if (result.status === 'OK') {
        onPaid(result);
        onClose();
      } else {
        setError(result.message || 'Payment failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Pay Loan: {loan.loan_id}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{marginBottom: '16px'}}>
          <p>Account: <strong>{loan.account_id}</strong></p>
          <p>Remaining: <strong className="amount-negative">${(loan.remaining || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</strong></p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Amount</label>
            <input required type="number" step="0.01" min="0.01" placeholder="1000.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Processing...' : 'Make Payment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [payLoan, setPayLoan] = useState(null);
  const [alert, setAlert] = useState(null);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getLoans();
      setLoans(result.loans || []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load loans' });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadLoans(); }, [loadLoans]);

  function showAlert(type, message) {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  }

  return (
    <div>
      <div className="page-header">
        <h2>Loan Management</h2>
        <p>Create and manage client loans</p>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Active Loans ({loans.length})</h3>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Loan</button>
        </div>

        {loading ? (
          <div className="loading">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="empty-state">
            <div className="icon">&#x1F3E6;</div>
            <p>No loans registered. Create a new loan for a client.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Loan ID</th><th>Account</th><th>Principal</th><th>Remaining</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loans.map((loan, i) => (
                <tr key={i}>
                  <td><strong>{loan.loan_id}</strong></td>
                  <td>{loan.account_id}</td>
                  <td>${(loan.principal || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="amount-negative">${(loan.remaining || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td><span className={`badge ${loan.status === 'PAID' ? 'badge-paid' : 'badge-active'}`}>{loan.status}</span></td>
                  <td>
                    {loan.status === 'ACTIVE' && (
                      <button className="btn btn-accent btn-sm" onClick={() => setPayLoan(loan)}>Pay</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateLoanModal
          onClose={() => setShowCreate(false)}
          onCreated={(result) => { loadLoans(); showAlert('success', `Loan created. Monthly payment: $${result.monthly_payment}`); }}
        />
      )}
      {payLoan && (
        <PayLoanModal
          loan={payLoan}
          onClose={() => setPayLoan(null)}
          onPaid={(result) => { loadLoans(); showAlert('success', `Payment successful. Remaining: $${result.remaining}`); }}
        />
      )}
    </div>
  );
}

export default Loans;
