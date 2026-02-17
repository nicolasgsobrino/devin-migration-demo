import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Operations from './pages/Operations';
import Loans from './pages/Loans';
import Reports from './pages/Reports';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>COBOL Bank</h1>
        <p>Legacy Banking System</p>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">General</div>
        <NavLink to="/" end><span className="icon">&#x1F4CA;</span> Dashboard</NavLink>
        <div className="sidebar-section">Management</div>
        <NavLink to="/accounts"><span className="icon">&#x1F465;</span> Clients</NavLink>
        <div className="sidebar-section">Banking</div>
        <NavLink to="/operations"><span className="icon">&#x1F4B1;</span> Operations</NavLink>
        <NavLink to="/loans"><span className="icon">&#x1F3E6;</span> Loans</NavLink>
        <div className="sidebar-section">Analytics</div>
        <NavLink to="/reports"><span className="icon">&#x1F4C8;</span> Reports</NavLink>
      </nav>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
