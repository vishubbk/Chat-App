import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Convert to boolean
  }, []);

  const handleProtectedLink = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first!');
      navigate('/login');
      return;
    }
    navigate('/manage-group');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          Chat App
        </Link>

        <div className="space-x-4">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="text-white hover:text-gray-300">
                Login
              </Link>
              <Link to="/signup" className="text-white hover:text-gray-300">
                Sign Up
              </Link>
            </>
          ) : (
            <>
            
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
