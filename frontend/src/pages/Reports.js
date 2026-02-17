import React, { useState } from 'react';
import { api } from '../services/api';

function Reports() {
  const [activeTab, setActiveTab] = useState('score');
  const [scoreForm, setScoreForm] = useState({ account_id: '', name: '', income: '', debt: '' });
  const [scoreResult, setScoreResult] = useState(null);
  const [txnAccountId, setTxnAccountId] = useState('');
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleScore(e) {
    e.preventDefault();
    setLoading(true);
    setScoreResult(null);
    try {
      const res = await api.getCreditScore(scoreForm.account_id, scoreForm.name, scoreForm.income, scoreForm.debt);
      setScoreResult(res);
    } catch (err) {
      setScoreResult({ status: 'ERROR', message: 'Network error' });
    }
    setLoading(false);
  }

  async function handleTransactions(e) {
    e.preventDefault();
    setLoading(true);
    setTransactions(null);
    try {
      const res = await api.getTransactions(txnAccountId);
      setTransactions(res);
    } catch (err) {
      setTransactions({ status: 'ERROR', message: 'Network error' });
    }
    setLoading(false);
  }

  function getScoreClass(score) {
    if (score >= 750) return 'score-excellent';
    if (score >= 600) return 'score-good';
    if (score >= 400) return 'score-fair';
    return 'score-poor';
  }

  function getScoreLabel(score) {
    if (score >= 750) return 'Excellent';
    if (score >= 600) return 'Good';
    if (score >= 400) return 'Fair';
    return 'Needs Improvement';
  }

  return (
    <div>
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <p>Credit scoring and transaction history</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={`btn ${activeTab === 'score' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('score')}>Credit Score</button>
        <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('history')}>Transaction History</button>
      </div>

      {activeTab === 'score' && (
        <>
          <div className="card">
            <div className="card-header"><h3>Calculate Credit Score</h3></div>
            <form onSubmit={handleScore}>
              <div className="form-row">
                <div className="form-group">
                  <label>Account ID</label>
                  <input required placeholder="e.g. ACC001" value={scoreForm.account_id} onChange={e => setScoreForm({...scoreForm, account_id: e.target.value.toUpperCase()})} />
                </div>
                <div className="form-group">
                  <label>Client Name</label>
                  <input required placeholder="Full name" value={scoreForm.name} onChange={e => setScoreForm({...scoreForm, name: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Annual Income</label>
                  <input required type="number" step="0.01" min="0" placeholder="75000.00" value={scoreForm.income} onChange={e => setScoreForm({...scoreForm, income: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Total Debt</label>
                  <input required type="number" step="0.01" min="0" placeholder="10000.00" value={scoreForm.debt} onChange={e => setScoreForm({...scoreForm, debt: e.target.value})} />
                </div>
              </div>
              <button className="btn btn-primary" disabled={loading}>{loading ? 'Calculating...' : 'Calculate Score'}</button>
            </form>
          </div>

          {scoreResult && (
            <div className="card">
              {scoreResult.status === 'OK' ? (
                <div className="score-display">
                  <div className={`score-circle ${getScoreClass(scoreResult.score)}`}>
                    {scoreResult.score}
                  </div>
                  <h3>{getScoreLabel(scoreResult.score)}</h3>
                  <p style={{color: 'var(--text-secondary)', marginTop: '8px'}}>
                    Account: {scoreResult.account}
                  </p>
                </div>
              ) : (
                <div className="alert alert-error">{scoreResult.message}</div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          <div className="card">
            <div className="card-header"><h3>Transaction History</h3></div>
            <form onSubmit={handleTransactions}>
              <div className="form-group" style={{maxWidth: '300px'}}>
                <label>Account ID</label>
                <input required placeholder="e.g. ACC001" value={txnAccountId} onChange={e => setTxnAccountId(e.target.value.toUpperCase())} />
              </div>
              <button className="btn btn-primary" disabled={loading}>{loading ? 'Loading...' : 'View Transactions'}</button>
            </form>
          </div>

          {transactions && (
            <div className="card">
              {transactions.status === 'OK' ? (
                <>
                  <div className="card-header">
                    <h3>Transactions for {transactions.account_id} ({transactions.count} total)</h3>
                  </div>
                  {transactions.transactions && transactions.transactions.length > 0 ? (
                    <table>
                      <thead>
                        <tr><th>ID</th><th>Type</th><th>Amount</th><th>Balance After</th><th>Description</th></tr>
                      </thead>
                      <tbody>
                        {transactions.transactions.slice().reverse().map((txn, i) => (
                          <tr key={i}>
                            <td>{txn.txn_id}</td>
                            <td><span className={`badge ${txn.type.includes('DEPOSIT') || txn.type.includes('IN') ? 'badge-active' : 'badge-inactive'}`}>{txn.type}</span></td>
                            <td className={txn.type.includes('WITHDRAWAL') || txn.type.includes('PAYMENT') || txn.type.includes('OUT') ? 'amount-negative' : 'amount-positive'}>
                              ${(txn.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                            </td>
                            <td>${(txn.balance_after || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            <td>{txn.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state"><p>No transactions found for this account.</p></div>
                  )}
                </>
              ) : (
                <div className="alert alert-error">{transactions.message}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reports;
