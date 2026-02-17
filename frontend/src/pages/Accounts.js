import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

function CreateAccountModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ account_id: '', name: '', type: 'CHECKING', balance: '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const firstInput = useRef(null);

  useEffect(() => { if (firstInput.current) firstInput.current.focus(); }, []);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await api.createAccount(form);
      if (result.status === 'OK') { onCreated(); onClose(); }
      else { setError(result.message || 'Failed to create account'); }
    } catch (err) { setError('Network error'); }
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
              <input ref={firstInput} required placeholder="e.g. ACC004" maxLength={6} value={form.account_id} onChange={e => handleChange('account_id', e.target.value.toUpperCase())} />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select value={form.type} onChange={e => handleChange('type', e.target.value)}>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Client Name</label>
            <input required placeholder="Full name" maxLength={30} value={form.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Initial Balance</label>
            <input type="number" step="0.01" min="0" placeholder="0.00" value={form.balance} onChange={e => handleChange('balance', e.target.value)} />
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

function AccountDetail({ accountId, onClose, onRefresh }) {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const nameInput = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, txns] = await Promise.all([api.getAccount(accountId), api.getTransactions(accountId)]);
      setAccount(acc);
      setNewName(acc.name || '');
      if (txns.transactions) setTransactions(txns.transactions);
    } catch (err) { /* ignore */ }
    setLoading(false);
  }, [accountId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (editing && nameInput.current) nameInput.current.focus(); }, [editing]);

  async function handleUpdate() {
    const result = await api.updateAccount(accountId, { name: newName });
    if (result.status === 'OK') { setEditing(false); load(); onRefresh(); }
  }

  async function handleDelete() {
    if (!window.confirm('Delete account ' + accountId + '?')) return;
    const result = await api.deleteAccount(accountId);
    if (result.status === 'OK') { onRefresh(); onClose(); }
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleUpdate(); }
    if (e.key === 'Escape') { setEditing(false); setNewName(account?.name || ''); }
  }

  if (loading) return <div className="modal-overlay"><div className="modal"><div className="loading">Loading...</div></div></div>;

  const fmt = (v) => (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <h3>Account: {accountId}</h3>
        {account && account.status === 'OK' ? (
          <>
            <div className="detail-row">
              <span className="detail-label">Client Name</span>
              <span className="detail-value">
                {editing ? (
                  <span style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <input ref={nameInput} value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={handleNameKeyDown} style={{padding:'8px 12px',background:'var(--bg-input)',border:'1.5px solid var(--text)',borderRadius:'var(--radius)',color:'var(--text)',fontSize:'14px',outline:'none',width:'200px'}} />
                    <button className="btn btn-primary btn-sm" onClick={handleUpdate}>Save</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  </span>
                ) : (
                  <span style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    {account.name}
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit</button>
                  </span>
                )}
              </span>
            </div>
            <div className="detail-row"><span className="detail-label">Type</span><span className="detail-value"><span className={'badge badge-' + (account.type || '').toLowerCase()}>{account.type}</span></span></div>
            <div className="detail-row"><span className="detail-label">Balance</span><span className="detail-value amount-positive">${fmt(account.balance)}</span></div>
            <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={'badge ' + (account.active ? 'badge-active' : 'badge-inactive')}>{account.active ? 'Active' : 'Inactive'}</span></span></div>
            <div className="detail-row"><span className="detail-label">Created</span><span className="detail-value">{account.created}</span></div>

            {transactions.length > 0 && (
              <div style={{marginTop:'20px'}}>
                <h4 style={{fontSize:'15px',fontWeight:700,marginBottom:'12px',color:'var(--text)'}}>Recent Transactions</h4>
                <table>
                  <thead><tr><th>#</th><th>Type</th><th>Amount</th><th>Balance</th><th>Description</th></tr></thead>
                  <tbody>
                    {transactions.slice(-5).reverse().map((txn, i) => (
                      <tr key={i}>
                        <td>{txn.txn_id}</td>
                        <td><span className={'badge ' + (txn.type.includes('DEPOSIT') || txn.type.includes('IN') ? 'badge-active' : 'badge-inactive')}>{txn.type}</span></td>
                        <td className={txn.type.includes('WITHDRAWAL') || txn.type.includes('PAYMENT') || txn.type.includes('OUT') ? 'amount-negative' : 'amount-positive'}>${fmt(txn.amount)}</td>
                        <td>${fmt(txn.balance_after)}</td>
                        <td style={{color:'var(--text-muted)'}}>{txn.description}</td>
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
  const [search, setSearch] = useState('');

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

  function showAlertMsg(type, message) {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  }

  const filtered = accounts.filter(acc => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (acc.account_id || '').toLowerCase().includes(s) || (acc.name || '').toLowerCase().includes(s) || (acc.type || '').toLowerCase().includes(s);
  });

  const fmt = (v) => (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div>
      <div className="page-header">
        <h2>Client Accounts</h2>
        <p>Manage bank client accounts</p>
      </div>

      {alert && <div className={'alert alert-' + alert.type}>{alert.message}</div>}

      <div style={{display:'flex',gap:'12px',marginBottom:'20px',alignItems:'center'}}>
        <div className="search-bar" style={{flex:1}}>
          <span style={{color:'var(--text-muted)',fontSize:'16px'}}>&#128269;</span>
          <input placeholder="Search by ID, name, or type..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Account</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Accounts ({filtered.length}{search ? ' / ' + accounts.length : ''})</h3>
          <button className="btn btn-outline btn-sm" onClick={loadAccounts}>Refresh</button>
        </div>

        {loading ? (
          <div className="loading">Loading accounts...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#128203;</div>
            <p>{search ? 'No accounts match your search.' : 'No accounts yet. Create your first client account.'}</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Account ID</th><th>Client Name</th><th>Type</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((acc, i) => (
                <tr key={i} style={{cursor:'pointer'}} onClick={() => setSelectedAccount(acc.account_id)}>
                  <td><strong>{acc.account_id}</strong></td>
                  <td>{acc.name}</td>
                  <td><span className={'badge badge-' + (acc.type || '').toLowerCase()}>{acc.type}</span></td>
                  <td className="amount-positive">${fmt(acc.balance)}</td>
                  <td><span className={'badge ' + (acc.active !== false ? 'badge-active' : 'badge-inactive')}>{acc.active !== false ? 'Active' : 'Inactive'}</span></td>
                  <td><button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedAccount(acc.account_id); }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} onCreated={() => { loadAccounts(); showAlertMsg('success', 'Account created successfully'); }} />}
      {selectedAccount && <AccountDetail accountId={selectedAccount} onClose={() => setSelectedAccount(null)} onRefresh={() => { loadAccounts(); showAlertMsg('success', 'Account updated'); }} />}
    </div>
  );
}

export default Accounts;
