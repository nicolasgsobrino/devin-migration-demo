import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

function CreateAccountModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ account_id: '', name: '', type: 'CHECKING', balance: '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await api.createAccount(form);
      if (result.status === 'OK') {
        onCreated();
        onClose();
      } else {
        setError(result.message || 'Failed to create account');
      }
    } catch (err) {
      setError('Network error');
    }
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>New Client Account</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Account ID</label>
              <input required placeholder="e.g. ACC004" maxLength={6} value={form.account_id} onChange={e => setForm({...form, account_id: e.target.value.toUpperCase()})} />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Client Name</label>
            <input required placeholder="Full name" maxLength={30} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Initial Balance</label>
            <input type="number" step="0.01" min="0" placeholder="0.00" value={form.balance} onChange={e => setForm({...form, balance: e.target.value})} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AccountDetail({ accountId, onClose, onDeleted }) {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, txns] = await Promise.all([
        api.getAccount(accountId),
        api.getTransactions(accountId)
      ]);
      setAccount(acc);
      setNewName(acc.name || '');
      if (txns.transactions) setTransactions(txns.transactions);
    } catch (err) { /* ignore */ }
    setLoading(false);
  }, [accountId]);

  useEffect(() => { load(); }, [load]);

  async function handleUpdate() {
    const result = await api.updateAccount(accountId, { name: newName });
    if (result.status === 'OK') {
      setEditing(false);
      load();
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete account ${accountId}? This cannot be undone.`)) return;
    const result = await api.deleteAccount(accountId);
    if (result.status === 'OK') {
      onDeleted();
      onClose();
    }
  }

  if (loading) return <div className="modal-overlay"><div className="modal"><div className="loading">Loading...</div></div></div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{minWidth: '600px'}} onClick={e => e.stopPropagation()}>
        <h3>Account Details: {accountId}</h3>
        {account && account.status === 'OK' ? (
          <>
            <table>
              <tbody>
                <tr>
                  <td><strong>Name</strong></td>
                  <td>
                    {editing ? (
                      <span style={{display:'flex',gap:'8px'}}>
                        <input value={newName} onChange={e => setNewName(e.target.value)} style={{flex:1}} />
                        <button className="btn btn-primary btn-sm" onClick={handleUpdate}>Save</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                      </span>
                    ) : (
                      <span>{account.name} <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit</button></span>
                    )}
                  </td>
                </tr>
                <tr><td><strong>Type</strong></td><td><span className={`badge badge-${(account.type || '').toLowerCase()}`}>{account.type}</span></td></tr>
                <tr><td><strong>Balance</strong></td><td className="amount-positive">${(account.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td></tr>
                <tr><td><strong>Status</strong></td><td><span className={`badge ${account.active ? 'badge-active' : 'badge-inactive'}`}>{account.active ? 'Active' : 'Inactive'}</span></td></tr>
                <tr><td><strong>Created</strong></td><td>{account.created}</td></tr>
              </tbody>
            </table>

            {transactions.length > 0 && (
              <div style={{marginTop: '16px'}}>
                <h4 style={{marginBottom: '8px'}}>Recent Transactions</h4>
                <table>
                  <thead><tr><th>#</th><th>Type</th><th>Amount</th><th>Balance</th><th>Description</th></tr></thead>
                  <tbody>
                    {transactions.slice(-5).reverse().map((txn, i) => (
                      <tr key={i}>
                        <td>{txn.txn_id}</td>
                        <td>{txn.type}</td>
                        <td className={txn.type.includes('WITHDRAWAL') || txn.type.includes('PAYMENT') || txn.type.includes('OUT') ? 'amount-negative' : 'amount-positive'}>
                          ${(txn.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </td>
                        <td>${(txn.balance_after || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td>{txn.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="alert alert-error">Account not found</div>
        )}
        <div className="modal-actions">
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete Account</button>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [alert, setAlert] = useState(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getAccounts();
      setAccounts(result.accounts || []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load accounts' });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  return (
    <div>
      <div className="page-header">
        <h2>Client Accounts</h2>
        <p>Manage bank client accounts</p>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Accounts ({accounts.length})</h3>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Account</button>
        </div>

        {loading ? (
          <div className="loading">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <div className="icon">&#x1F4CB;</div>
            <p>No accounts yet. Create your first client account.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Account ID</th><th>Client Name</th><th>Type</th><th>Balance</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {accounts.map((acc, i) => (
                <tr key={i}>
                  <td><strong>{acc.account_id}</strong></td>
                  <td>{acc.name}</td>
                  <td><span className={`badge badge-${(acc.type || '').toLowerCase()}`}>{acc.type}</span></td>
                  <td className="amount-positive">${(acc.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedAccount(acc.account_id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} onCreated={() => { loadAccounts(); setAlert({type:'success', message:'Account created successfully'}); setTimeout(() => setAlert(null), 3000); }} />}
      {selectedAccount && <AccountDetail accountId={selectedAccount} onClose={() => setSelectedAccount(null)} onDeleted={() => { loadAccounts(); setAlert({type:'success', message:'Account deleted'}); setTimeout(() => setAlert(null), 3000); }} />}
    </div>
  );
}

export default Accounts;
