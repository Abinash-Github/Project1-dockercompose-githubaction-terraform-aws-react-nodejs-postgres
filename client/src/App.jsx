import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import UserDetail from "./pages/UserDetail";

// Loading Component (Updated to match the dark neon theme)
function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="spinner-neon"></div>
      <p>SYNCING DATABASE...</p>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        {/* The redundant Header function has been removed to fix the brand split */}
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