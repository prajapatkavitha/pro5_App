- App.js

jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import Menu from './Menu';
import About from './About';
import Footer from './Footer';
import Login from './Login';
import Register from './Register';
import Order from './Order';
import Contact from './Contact';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/menu')
      .then(response => response.json())
      .then(data => setMenuItems(data))
      .catch(error => setError(error.message));
  }, []);

  return (
    <div className="App">
      <Header user={user} />
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <Menu menuItems={menuItems} user={user} />
      )}
      <About />
      <Footer />
      {user ? (
        <Order user={user} />
      ) : (
        <Login setUser={setUser} />
      )}
      <Register />
      <Contact />
    </div>
  );
}

export default App;


