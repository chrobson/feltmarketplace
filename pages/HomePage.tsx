
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { mockListings, mockUsers } from '../data/mockData';
import ListingCard from '../components/ListingCard';
import ProfileCard from '../components/ProfileCard';
import Button from '../components/Button';
import { AuthContext } from '../App';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';

const HomePage: React.FC = () => {
  const auth = useContext(AuthContext);
  const featuredListings = mockListings.filter(l => l.isFeatured).slice(0, 3);
  const topPlayers = mockUsers.filter(u => u.role === UserRole.PLAYER).sort((a,b) => b.starRating - a.starRating).slice(0,3);

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-xl">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to {APP_NAME}!</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Your premier destination for poker staking, coaching, and services. Connect with trusted players and backers in a secure marketplace.
        </p>
        <div className="space-x-4">
          <Link to="/browse">
            <Button variant="primary" size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800">Browse Listings</Button>
          </Link>
          {auth?.currentUser?.role === UserRole.PLAYER && (
            <Link to="/create-listing">
              <Button variant="secondary" size="lg">Create a Listing</Button>
            </Link>
          )}
        </div>
      </section>

      {featuredListings.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-blue-500">Featured Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {topPlayers.length > 0 && (
         <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-green-500">Top Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topPlayers.map(player => (
              <ProfileCard key={player.id} user={player} />
            ))}
          </div>
        </section>
      )}

      <section className="py-10 bg-gray-50 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
          <div className="p-4">
            <div className="text-blue-500 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8h2a1 1 0 011 1v2a1 1 0 01-1 1h-2"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12v2a1 1 0 01-1 1h-1"></path></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Players Create Listings</h3>
            <p className="text-gray-600">Offer staking, coaching, or other poker services with detailed descriptions and terms.</p>
          </div>
          <div className="p-4">
            <div className="text-green-500 mb-3">
               <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Backers & Students Browse</h3>
            <p className="text-gray-600">Search and filter to find the perfect opportunity or coach that matches your needs.</p>
          </div>
          <div className="p-4">
            <div className="text-yellow-500 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect & Transact</h3>
            <p className="text-gray-600">Use on-site messaging to discuss details. Payments are handled off-site for now.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
