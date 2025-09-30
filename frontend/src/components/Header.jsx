// frontend/src/components/Header.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white">
           AI Analyzer
        </Link>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/" className="text-gray-300 hover:text-white">Analyze</Link>
              <Link to="/history" className="text-gray-300 hover:text-white">History</Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="text-blue-400 hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
              <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;