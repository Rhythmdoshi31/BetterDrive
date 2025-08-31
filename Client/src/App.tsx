import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./components/Home";
// import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {

  useEffect(() => {
    // Re-apply the dark class after React has mounted
    const saved = localStorage.getItem('theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefers;
    
    if (dark) {
      document.documentElement.classList.add('dark');
    }
  }, []); // Empty dependency array = runs once after mount

  return (
    <div className="h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/dashboard" element={<Dashboard />} /> {/*<ProtectedRoute><Dashboard /></ProtectedRoute>*/}
        </Routes>
      </Router>
    </ div>
  );
};

export default App;
