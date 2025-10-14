import React from "react";
import { HashRouter   as Router, Routes, Route } from 'react-router-dom';


import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Project from "./pages/Project";
import Manage from "./pages/Manage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/project" element={<Project/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manage-group" element={<Manage/>} />
      </Routes>
    </Router>
  );
};
 
export default App;
