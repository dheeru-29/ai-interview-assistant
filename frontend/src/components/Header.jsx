// frontend/src/components/Header.jsx (Updated)
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
    <header className="text-indigo-500 bg-background p-4 shadow-md border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        {/* CHANGED: This link now points to /coach */}
        <Link to="/coach" class="text-indigo-500"className="text-xl font-bold text-foreground text-indigo-500">
           AI Assistant
        </Link>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              {/* CHANGED: This link now points to /coach */}
              <Link to="/coach" className="text-muted-foreground hover:text-foreground transition-colors text-indigo-500 ">Analyze</Link>
              <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors text-indigo-500">History</Link>
              <span className="text-border">|</span>
              <span className="text-muted-foreground text-indigo-500">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="text-primary hover:underline text-indigo-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;