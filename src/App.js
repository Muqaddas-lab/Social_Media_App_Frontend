
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PostDetails from "./pages/PostDetails";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar Always on Top */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/posts/:postId" element={<PostDetails />} />
          </Routes>
        </main>

        {/* Footer Always at Bottom */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;



