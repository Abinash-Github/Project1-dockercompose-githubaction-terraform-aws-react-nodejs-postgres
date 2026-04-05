import { useEffect, useState, useMemo } from "react";
import "./index.css";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState("dark");
  const usersPerPage = 6;

  const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:7999";

  useEffect(() => {
    fetch(`${API_URL}/users/all`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setUsers(json.data.users || []);
      });
  }, [API_URL]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="user-icon-svg">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );

  return (
    <div className="app-viewport">
      <header className="sticky-header">
        <div className="header-content">
          <div className="brand-zone">
            <h1 className="breathing-logo">USER<span>BASE</span></h1>
            <div className="nav-separator"></div>
            <span className="system-label">User Management System</span>
          </div>
          
          <div className="action-zone">
            <div className="search-box-container">
              <input 
                type="text" 
                placeholder="Search directory..." 
                className="header-search"
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === "dark" ? "☀️ LIGHT" : "🌙 DARK"}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="stats-header">
          <p>Total Records: <strong>{users.length}</strong> | Filtered: <strong>{filteredUsers.length}</strong></p>
        </div>

        <div className="funky-grid">
          {currentUsers.map((user) => (
            <div key={user.id} className="glass-card">
              <div className="card-top-row">
                <UserIcon />
                <span className="id-badge">ID-{user.id}</span>
              </div>
              <h3 className="display-name">{user.first_name} {user.last_name}</h3>
              <p className="display-email">{user.email}</p>
              <div className="card-footer-row">
                <span className="gender-tag">{user.gender}</span>
                <button 
                  className="pro-link-btn" 
                  onClick={() => window.location.href = `/user/${user.id}`}
                >
                  VIEW PROFILE
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="pagination-controls">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>PREV</button>
          <span className="page-tracker">{currentPage} / {totalPages || 1}</span>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>NEXT</button>
        </footer>
      </main>
    </div>
  );
};

export default Home;