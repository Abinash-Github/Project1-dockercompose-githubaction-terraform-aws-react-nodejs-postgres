import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import UserDetail from "./pages/UserDetail";

// Header Component
function Header() {
  const location = useLocation();

  return (
    <header style={{
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '1rem 0'
    }}>
      <Link to="/" style={{
        textDecoration: 'none',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#ffffff',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}>
        User Management System
      </Link>
      {location.pathname !== '/' && (
        <p style={{
          margin: '0.5rem 0 0 0',
          color: '#e0e7ff',
          fontSize: '0.9rem'
        }}>
          Manage and view user information
        </p>
      )}
    </header>
  );
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="loading">
      Loading users...
    </div>
  );
}

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Header />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="page-transition">
            <Routes>
              <Route path="/home" element={<Navigate to={"/"} />} />
              <Route path="/" element={<Home />} />
              <Route path="/user/:id" element={<UserDetail />} />
            </Routes>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
