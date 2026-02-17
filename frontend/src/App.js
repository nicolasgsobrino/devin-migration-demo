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
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">CB</div>
          <div className="sidebar-logo-text">
            <h1>COBOL Bank</h1>
            <p>Banking Platform</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">Overview</div>
        <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9632;</span> Dashboard
        </NavLink>
        <div className="sidebar-section">Management</div>
        <NavLink to="/accounts" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9679;</span> Clients
        </NavLink>
        <NavLink to="/operations" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#8644;</span> Operations
        </NavLink>
        <div className="sidebar-section">Finance</div>
        <NavLink to="/loans" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9733;</span> Loans
        </NavLink>
        <NavLink to="/reports" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">&#9776;</span> Reports
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        COBOL Backend v2.0
      </div>
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
