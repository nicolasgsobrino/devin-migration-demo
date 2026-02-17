import React, { useState } from 'react';
import { api } from '../services/api';

function Operations() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depositForm, setDepositForm] = useState({ account_id: '', amount: '' });
  const [withdrawForm, setWithdrawForm] = useState({ account_id: '', amount: '' });
  const [transferForm, setTransferForm] = useState({ from: '', to: '', amount: '' });

  async function handleDeposit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.deposit(depositForm.account_id, depositForm.amount);
      setResult(res);
    } catch (err) {
      setResult({ status: 'ERROR', message: 'Network error' });
    }
    setLoading(false);
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.withdraw(withdrawForm.account_id, withdrawForm.amount);
      setResult(res);
    } catch (err) {
      setResult({ status: 'ERROR', message: 'Network error' });
    }
    setLoading(false);
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.transfer(transferForm.from, transferForm.to, transferForm.amount);
      setResult(res);
    } catch (err) {
      setResult({ status: 'ERROR', message: 'Network error' });
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <h2>Banking Operations</h2>
        <p>Perform deposits, withdrawals, and transfers</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={`btn ${activeTab === 'deposit' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('deposit'); setResult(null); }}>Deposit</button>
        <button className={`btn ${activeTab === 'withdraw' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('withdraw'); setResult(null); }}>Withdraw</button>
        <button className={`btn ${activeTab === 'transfer' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setActiveTab('transfer'); setResult(null); }}>Transfer</button>
      </div>

      {result && (
        <div className={`alert ${result.status === 'OK' ? 'alert-success' : 'alert-error'}`}>
          {result.status === 'OK' ? (
            activeTab === 'deposit' ? `Deposited $${result.deposited} successfully. New balance: $${result.new_balance}` :
            activeTab === 'withdraw' ? `Withdrew $${result.withdrawn} successfully. New balance: $${result.new_balance}` :
            `Transfer of $${result.amount} completed successfully.`
          ) : result.message}
        </div>
      )}

      {activeTab === 'deposit' && (
        <div className="card">
          <div className="card-header"><h3>Make a Deposit</h3></div>
          <form onSubmit={handleDeposit}>
            <div className="form-row">
              <div className="form-group">
                <label>Account ID</label>
                <input required placeholder="e.g. ACC001" value={depositForm.account_id} onChange={e => setDepositForm({...depositForm, account_id: e.target.value.toUpperCase()})} />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={depositForm.amount} onChange={e => setDepositForm({...depositForm, amount: e.target.value})} />
              </div>
            </div>
            <button className="btn btn-accent" disabled={loading}>{loading ? 'Processing...' : 'Confirm Deposit'}</button>
          </form>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="card">
          <div className="card-header"><h3>Make a Withdrawal</h3></div>
          <form onSubmit={handleWithdraw}>
            <div className="form-row">
              <div className="form-group">
                <label>Account ID</label>
                <input required placeholder="e.g. ACC001" value={withdrawForm.account_id} onChange={e => setWithdrawForm({...withdrawForm, account_id: e.target.value.toUpperCase()})} />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} />
              </div>
            </div>
            <button className="btn btn-danger" disabled={loading}>{loading ? 'Processing...' : 'Confirm Withdrawal'}</button>
          </form>
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="card">
          <div className="card-header"><h3>Bank Transfer</h3></div>
          <form onSubmit={handleTransfer}>
            <div className="form-row">
              <div className="form-group">
                <label>From Account</label>
                <input required placeholder="e.g. ACC001" value={transferForm.from} onChange={e => setTransferForm({...transferForm, from: e.target.value.toUpperCase()})} />
              </div>
              <div className="form-group">
                <label>To Account</label>
                <input required placeholder="e.g. ACC002" value={transferForm.to} onChange={e => setTransferForm({...transferForm, to: e.target.value.toUpperCase()})} />
              </div>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={transferForm.amount} onChange={e => setTransferForm({...transferForm, amount: e.target.value})} />
            </div>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Confirm Transfer'}</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Operations;
