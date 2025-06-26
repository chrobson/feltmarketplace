
import React, { useState, createContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile, AuthContextType, UserRole } from './types';
import { MOCK_PLAYER_PROFILE, MOCK_BACKER_PROFILE, MOCK_ADMIN_PROFILE } from './constants';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BrowseListingsPage from './pages/BrowseListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import UserProfilePage from './pages/UserProfilePage'; 
import MessagesPage from './pages/MessagesPage'; 
import AdminDashboardPage from './pages/AdminDashboardPage'; // Ensured relative path

export const AuthContext = createContext<AuthContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const loginAsPlayer = useCallback(() => setCurrentUser(MOCK_PLAYER_PROFILE), []);
  const loginAsBacker = useCallback(() => setCurrentUser(MOCK_BACKER_PROFILE), []);
  const loginAsAdmin = useCallback(() => setCurrentUser(MOCK_ADMIN_PROFILE), []);
  const logout = useCallback(() => setCurrentUser(null), []);

  const authContextValue: AuthContextType = {
    currentUser,
    setCurrentUser,
    loginAsPlayer,
    loginAsBacker,
    loginAsAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowseListingsPage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route 
                path="/create-listing" 
                element={currentUser?.role === UserRole.PLAYER ? <CreateListingPage /> : <Navigate to="/" />} 
              />
              <Route path="/profile/:id" element={<UserProfilePage />} />
              <Route 
                path="/messages" 
                element={currentUser ? <MessagesPage /> : <Navigate to="/" />} 
              />
              <Route 
                path="/admin" 
                element={currentUser?.role === UserRole.ADMIN ? <AdminDashboardPage /> : <Navigate to="/" />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
