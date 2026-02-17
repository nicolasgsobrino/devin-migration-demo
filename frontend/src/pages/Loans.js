import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';

function AmortizationChart({ principal, rate, termMonths }) {
  const p = Number(principal) || 0;
  const r = (Number(rate) || 0) / 100 / 12;
  const n = Number(termMonths) || 12;
  if (p <= 0 || r <= 0 || n <= 0) return null;

  const payment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  let balance = p;
  const data = [];
  let totalInterest = 0;

  for (let i = 1; i <= n && i <= 60; i++) {
    const interest = balance * r;
    const principalPart = payment - interest;
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;
    if (i % Math.max(1, Math.floor(n / 12)) === 0 || i === 1 || i === n) {
      data.push({ month: 'M' + i, principal: Math.round(principalPart), interest: Math.round(interest), balance: Math.round(balance) });
    }
  }

  const pieData = [
    { name: 'Principal', value: Math.round(p) },
    { name: 'Interest', value: Math.round(totalInterest) }
  ];
  const COLORS = ['#191c1f', '#e8e8e8'];

  return (
    <div>
      <div style={{marginBottom:'20px'}}>
        <div className="detail-row"><span className="detail-label">Monthly Payment</span><span className="detail-value" style={{fontSize:'18px',fontWeight:800}}>${payment.toFixed(2)}</span></div>
        <div className="detail-row"><span className="detail-label">Total Interest</span><span className="detail-value amount-negative">${totalInterest.toFixed(2)}</span></div>
        <div className="detail-row"><span className="detail-label">Total Cost</span><span className="detail-value">${(p + totalInterest).toFixed(2)}</span></div>
      </div>

      <div className="grid-2">
        <div>
          <h4 style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'10px',fontWeight:600}}>Payment Breakdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
              <XAxis dataKey="month" tick={{fill:'#999',fontSize:10}} />
              <YAxis tick={{fill:'#999',fontSize:10}} />
              <Tooltip contentStyle={{background:'#fff',border:'1px solid #e8e8e8',borderRadius:'12px',color:'#191c1f',boxShadow:'0 4px 12px rgba(0,0,0,.08)'}} />
              <Bar dataKey="principal" stackId="a" fill="#191c1f" name="Principal" radius={[0,0,0,0]} />
              <Bar dataKey="interest" stackId="a" fill="#e8e8e8" name="Interest" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'10px',fontWeight:600}}>Principal vs Interest</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
              </Pie>
              <Tooltip contentStyle={{background:'#fff',border:'1px solid #e8e8e8',borderRadius:'12px',color:'#191c1f'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function CreateLoanModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ account_id: '', loan_id: '', principal: '', rate: '5.00', term_months: '12' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const firstInput = useRef(null);

  useEffect(() => { if (firstInput.current) firstInput.current.focus(); }, []);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setShowPreview(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const result = await api.createLoan(form);
      if (result.status === 'OK') { onCreated(result); onClose(); }
      else { setError(result.message || 'Failed to create loan'); }
    } catch (err) { setError('Network error'); }
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <h3>Create New Loan</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Account ID</label>
              <input ref={firstInput} required placeholder="e.g. ACC001" value={form.account_id} onChange={e => handleChange('account_id', e.target.value.toUpperCase())} />
            </div>
            <div className="form-group">
              <label>Loan ID</label>
              <input required placeholder="e.g. LOAN003" maxLength={8} value={form.loan_id} onChange={e => handleChange('loan_id', e.target.value.toUpperCase())} />
            </div>
          </div>
          <div className="form-group">
            <label>Principal Amount</label>
            <input required type="number" step="0.01" min="100" placeholder="10000.00" value={form.principal} onChange={e => handleChange('principal', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Annual Interest Rate (%)</label>
              <input required type="number" step="0.01" min="0.01" max="30" value={form.rate} onChange={e => handleChange('rate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Term (months)</label>
              <input required type="number" min="1" max="360" value={form.term_months} onChange={e => handleChange('term_months', e.target.value)} />
            </div>
          </div>

          {form.principal && form.rate && form.term_months && (
            <div style={{marginBottom:'16px'}}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? 'Hide' : 'Preview'} Interest Breakdown
              </button>
              {showPreview && (
                <div className="card" style={{marginTop:'14px'}}>
                  <AmortizationChart principal={form.principal} rate={form.rate} termMonths={form.term_months} />
                </div>
              )}
            </div>
          )}

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
  const inputRef = useRef(null);

  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const result = await api.payLoan(loan.loan_id, loan.account_id, amount);
      if (result.status === 'OK') { onPaid(result); onClose(); }
      else { setError(result.message || 'Payment failed'); }
    } catch (err) { setError('Network error'); }
    setSaving(false);
  }

  const fmt = (v) => (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const paidPct = loan.principal > 0 ? Math.max(0, Math.min(100, ((loan.principal - (loan.remaining || 0)) / loan.principal) * 100)) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Pay Loan: {loan.loan_id}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{marginBottom:'20px'}}>
          <div className="detail-row"><span className="detail-label">Account</span><span className="detail-value">{loan.account_id}</span></div>
          <div className="detail-row"><span className="detail-label">Principal</span><span className="detail-value">${fmt(loan.principal)}</span></div>
          <div className="detail-row"><span className="detail-label">Remaining</span><span className="detail-value amount-negative">${fmt(loan.remaining)}</span></div>
          <div style={{marginTop:'12px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'var(--text-muted)',marginBottom:'6px'}}>
              <span>Paid: {paidPct.toFixed(1)}%</span>
              <span>${fmt(loan.principal - (loan.remaining || 0))} / ${fmt(loan.principal)}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill green" style={{width: paidPct + '%'}}></div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Amount</label>
            <input ref={inputRef} required type="number" step="0.01" min="0.01" placeholder="1000.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-green" disabled={saving}>{saving ? 'Processing...' : 'Make Payment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoanDetail({ loan }) {
  if (!loan) return null;
  const paidPct = loan.principal > 0 ? Math.max(0, Math.min(100, ((loan.principal - (loan.remaining || 0)) / loan.principal) * 100)) : 0;
  const fmt = (v) => (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="card" style={{marginTop:'16px'}}>
      <div className="card-header"><h3>Loan Details: {loan.loan_id}</h3></div>
      <div className="grid-2">
        <div>
          <div className="detail-row"><span className="detail-label">Account</span><span className="detail-value">{loan.account_id}</span></div>
          <div className="detail-row"><span className="detail-label">Principal</span><span className="detail-value">${fmt(loan.principal)}</span></div>
          <div className="detail-row"><span className="detail-label">Remaining</span><span className="detail-value amount-negative">${fmt(loan.remaining)}</span></div>
          <div className="detail-row"><span className="detail-label">Rate</span><span className="detail-value">{loan.rate || 'N/A'}%</span></div>
          <div className="detail-row"><span className="detail-label">Term</span><span className="detail-value">{loan.term_months || 'N/A'} months</span></div>
          <div className="detail-row"><span className="detail-label">Monthly Payment</span><span className="detail-value" style={{fontWeight:800}}>${fmt(loan.monthly_payment)}</span></div>
          <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value"><span className={'badge ' + (loan.status === 'PAID' ? 'badge-paid' : 'badge-active')}>{loan.status}</span></span></div>
        </div>
        <div>
          <div style={{marginBottom:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'var(--text-muted)',marginBottom:'8px'}}>
              <span>Repayment Progress</span>
              <span style={{fontWeight:700,color:'var(--text)'}}>{paidPct.toFixed(1)}%</span>
            </div>
            <div className="progress-bar" style={{height:'10px'}}>
              <div className="progress-fill green" style={{width: paidPct + '%'}}></div>
            </div>
          </div>
          {loan.principal && loan.rate && loan.term_months && (
            <AmortizationChart principal={loan.principal} rate={loan.rate} termMonths={loan.term_months} />
          )}
        </div>
      </div>
    </div>
  );
}

function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [payLoan, setPayLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
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

  function showAlertMsg(type, message) {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  }

  const fmt = (v) => (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div>
      <div className="page-header">
        <h2>Loan Management</h2>
        <p>Create, manage and visualize client loans</p>
      </div>

      {alert && <div className={'alert alert-' + alert.type}>{alert.message}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Active Loans ({loans.length})</h3>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Loan</button>
        </div>

        {loading ? (
          <div className="loading">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#9733;</div>
            <p>No loans registered. Create a new loan for a client.</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Loan ID</th><th>Account</th><th>Principal</th><th>Remaining</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loans.map((loan, i) => {
                const pct = loan.principal > 0 ? ((loan.principal - (loan.remaining || 0)) / loan.principal * 100) : 0;
                return (
                  <tr key={i} style={{cursor:'pointer'}} onClick={() => setSelectedLoan(selectedLoan?.loan_id === loan.loan_id ? null : loan)}>
                    <td><strong>{loan.loan_id}</strong></td>
                    <td>{loan.account_id}</td>
                    <td>${fmt(loan.principal)}</td>
                    <td className="amount-negative">${fmt(loan.remaining)}</td>
                    <td style={{width:'120px'}}>
                      <div className="progress-bar"><div className="progress-fill green" style={{width: Math.min(100, pct) + '%'}}></div></div>
                      <div style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'4px'}}>{pct.toFixed(0)}% paid</div>
                    </td>
                    <td><span className={'badge ' + (loan.status === 'PAID' ? 'badge-paid' : 'badge-active')}>{loan.status}</span></td>
                    <td>
                      {loan.status === 'ACTIVE' && (
                        <button className="btn btn-green btn-sm" onClick={(e) => { e.stopPropagation(); setPayLoan(loan); }}>Pay</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedLoan && <LoanDetail loan={selectedLoan} />}

      {showCreate && <CreateLoanModal onClose={() => setShowCreate(false)} onCreated={(result) => { loadLoans(); showAlertMsg('success', 'Loan created. Monthly payment: $' + result.monthly_payment); }} />}
      {payLoan && <PayLoanModal loan={payLoan} onClose={() => setPayLoan(null)} onPaid={(result) => { loadLoans(); setSelectedLoan(null); showAlertMsg('success', 'Payment successful. Remaining: $' + result.remaining); }} />}
    </div>
  );
}

export default Loans;
