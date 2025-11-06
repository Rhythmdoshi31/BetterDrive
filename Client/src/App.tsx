import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./components/Home";
import StarredFiles from "./pages/Starred";
import RecentFiles from "./pages/Recent";
import TrashFiles from "./pages/Trash";
import FoldersPage from "./pages/Folders";
import PreregisterPage from "./components/Pre-registerPage"
import SettingsPage from "./pages/Settings";
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
          <Route path="/starred" element={<StarredFiles />} />
          <Route path="/recent" element={<RecentFiles />} />
          <Route path="/trash" element={<TrashFiles />} />
          <Route path="/folders" element={<FoldersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/vip-list" element={<PreregisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ div>
  );
};

export default App;
