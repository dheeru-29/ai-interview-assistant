// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // Make sure this line exists

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Make sure <AuthProvider> wraps <App /> like this */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);