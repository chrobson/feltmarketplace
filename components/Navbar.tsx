
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
            {APP_NAME}
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/browse" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Browse Listings</Link>
            {auth?.currentUser && (
              <>
                {auth.currentUser.role === UserRole.PLAYER && (
                  <Link to="/create-listing" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Create Listing</Link>
                )}
                <Link to="/messages" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Messages</Link>
                {auth.currentUser.role === UserRole.ADMIN && (
                   <Link to="/admin" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Admin</Link>
                )}
                <Link to={`/profile/${auth.currentUser.id}`} className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                  {auth.currentUser.username}
                </Link>
                <button onClick={auth.logout} className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
              </>
            )}
            {!auth?.currentUser && (
              <div className="space-x-2">
                <button onClick={auth?.loginAsPlayer} className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium">Login as Player</button>
                <button onClick={auth?.loginAsBacker} className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium">Login as Backer</button>
                <button onClick={auth?.loginAsAdmin} className="bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded-md text-sm font-medium">Login as Admin</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
