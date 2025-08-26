import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./components/Home";

const App: React.FC = () => {

  return (
    <div className="h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </ div>
  );
};

export default App;
