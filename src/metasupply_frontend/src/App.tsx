import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import MyFiles from "./pages/MyFiles";
import Search from "./pages/Search";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-6 p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/myfiles" element={<MyFiles />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
