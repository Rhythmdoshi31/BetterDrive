import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';  // Import the Dashboard component

const App: React.FC = () => {
  const handleConnectDrive = (): void => {
    // Redirect to backend's OAuth initiation endpoint
    window.location.href = 'http://localhost:3000/auth/google';
  };
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add other routes here, e.g., <Route path="/signin" element={<SignIn />} /> */}
        <Route path="/" element={<div>Welcome to OneApp! <a href="/dashboard">Go to Dashboard</a>       <h2>Your Google Drive Files</h2>
              <button onClick={handleConnectDrive}>
                Connect Google Drive
              </button></div>} />  {/* Optional home page */}
      </Routes>
    </Router>
  );
};

export default App;
