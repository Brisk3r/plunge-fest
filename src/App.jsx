import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import './index.css';

function Navigation() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <nav className="navbar">
      <div className="logo">
        <h1>PLUNGE</h1>
        <span>Festival 2027</span>
      </div>
      <div className="nav-links">
        {isAdmin ? (
          <Link to="/" className="btn-outline" style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '30px' }}>
            Back to Festival
          </Link>
        ) : (
          <Link to="/admin" className="btn-outline" style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '30px' }}>
            Admin Panel
          </Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter basename="/plunge-fest">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
