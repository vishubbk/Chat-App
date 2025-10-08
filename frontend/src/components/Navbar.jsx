import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Chat App</Link>
        <div className="space-x-4">
          <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
          <Link to="/signup" className="text-white hover:text-gray-300">Sign Up</Link>
          <Link to="/manage-group" className="text-white hover:text-gray-300">Manage-Group</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;