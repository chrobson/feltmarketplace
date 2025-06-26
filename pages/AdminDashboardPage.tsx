import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { mockListings, mockUsers, updateListingStatus as apiUpdateListingStatus, toggleFeatureListing as apiToggleFeatureListing } from '../data/mockData';
import { Listing, UserProfile, ListingStatus, UserRole } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal'; // Import Modal
import { AuthContext } from '../App'; 
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboardPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const [listings, setListings] = useState<Listing[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'allListings'>('pending');

    // For rejection modal
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [currentListingToReject, setCurrentListingToReject] = useState<Listing | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const refreshData = () => {
        // Create new array references to ensure state updates trigger re-renders
        setListings([...mockListings]);
        setUsers([...mockUsers]);
    };

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => { // Simulate API call
            refreshData();
            setIsLoading(false);
        }, 300);
    }, []);
    
    const handleOpenRejectionModal = (listing: Listing) => {
        setCurrentListingToReject(listing);
        setRejectionReason('');
        setShowRejectionModal(true);
    };

    const handleConfirmRejectListing = () => {
        if (currentListingToReject) {
            apiUpdateListingStatus(currentListingToReject.id, ListingStatus.REJECTED, rejectionReason);
            refreshData(); // Refresh local state from potentially mutated mockData
        }
        setShowRejectionModal(false);
        setCurrentListingToReject(null);
        setRejectionReason('');
    };
    
    const handleUpdateListingStatus = (listingId: string, newStatus: ListingStatus) => {
        if (newStatus === ListingStatus.REJECTED) {
            const listingToReject = listings.find(l => l.id === listingId);
            if (listingToReject) {
                handleOpenRejectionModal(listingToReject);
            }
        } else {
            apiUpdateListingStatus(listingId, newStatus);
            refreshData();
        }
    };
    
    const handleToggleFeatureListing = (listingId: string) => {
        apiToggleFeatureListing(listingId); // Update in mock data source
        refreshData();
    };

    const handleUserAction = (userId: string, action: 'suspend' | 'ban') => {
        alert(`User ${userId} ${action} action clicked (not fully implemented). This would typically update user status in the backend and potentially their role or add a flag.`);
        // Example: const userToUpdate = mockUsers.find(u => u.id === userId); if(userToUpdate) { /* update status */ } refreshData();
    };

    if (auth?.currentUser?.role !== UserRole.ADMIN) {
        return <div className="text-center py-10 text-red-500">Access Denied. Admins only.</div>;
    }

    const pendingListings = listings.filter(l => l.status === ListingStatus.PENDING_APPROVAL);

    const renderPendingListings = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pending Approval ({pendingListings.length})</h2>
            {isLoading && <LoadingSpinner text="Loading pending listings..." />}
            {!isLoading && pendingListings.length === 0 && <p className="text-gray-500">No listings currently pending approval.</p>}
            {pendingListings.map(listing => (
                <div key={listing.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-blue-600">{listing.title}</h3>
                    <p className="text-sm text-gray-500">Type: {listing.listingType} | Player ID: {listing.playerId}</p>
                    <p className="my-2 text-sm text-gray-600 truncate-2-lines">{listing.description}</p>
                    <div className="mt-3 space-x-2 flex flex-wrap gap-2">
                        <Button variant="success" size="sm" onClick={() => handleUpdateListingStatus(listing.id, ListingStatus.ACTIVE)}>Approve</Button>
                        <Button variant="danger" size="sm" onClick={() => handleUpdateListingStatus(listing.id, ListingStatus.REJECTED)}>Reject</Button>
                        <Link to={`/listing/${listing.id}`}>
                            <Button variant="secondary" size="sm">View Details</Button>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderUserManagement = () => (
         <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">User Management ({users.length})</h2>
            {isLoading && <LoadingSpinner text="Loading users..." />}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <Link to={`/profile/${user.id}`} className="text-blue-600 hover:underline">
                                        {user.username}
                                    </Link>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm space-x-1">
                                    <Button variant="warning" size="sm" onClick={() => handleUserAction(user.id, 'suspend')}>Suspend</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleUserAction(user.id, 'ban')}>Ban</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const renderAllListings = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Listings ({listings.length})</h2>
            {isLoading && <LoadingSpinner text="Loading all listings..." />}
            {listings.map(listing => (
                 <div key={listing.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-600">{listing.title}</h3>
                            <p className="text-sm text-gray-500">
                                Status: <span className={`font-medium ${
                                    listing.status === ListingStatus.ACTIVE ? 'text-green-600' :
                                    listing.status === ListingStatus.PENDING_APPROVAL ? 'text-orange-500' :
                                    listing.status === ListingStatus.PAUSED ? 'text-yellow-600' :
                                    listing.status === ListingStatus.COMPLETED ? 'text-blue-700' :
                                    listing.status === ListingStatus.REJECTED ? 'text-red-600' :
                                    'text-gray-500' // Default or Cancelled
                                }`}>{listing.status}</span> | Player ID: {listing.playerId}
                            </p>
                            {listing.status === ListingStatus.REJECTED && listing.rejectionReason && (
                                <p className="text-xs text-red-500 mt-1">Reason: {listing.rejectionReason}</p>
                            )}
                        </div>
                        <Button 
                            variant={listing.isFeatured ? "warning" : "secondary"} 
                            size="sm" 
                            onClick={() => handleToggleFeatureListing(listing.id)}
                            className="mt-2 sm:mt-0"
                        >
                            {listing.isFeatured ? "Unfeature" : "Feature"}
                        </Button>
                    </div>
                    <p className="my-2 text-sm text-gray-600 truncate-2-lines">{listing.description}</p>
                    <div className="mt-3 space-x-2 flex flex-wrap gap-2">
                         {listing.status === ListingStatus.PENDING_APPROVAL && (
                            <>
                            <Button variant="success" size="sm" onClick={() => handleUpdateListingStatus(listing.id, ListingStatus.ACTIVE)}>Approve</Button>
                            <Button variant="danger" size="sm" onClick={() => handleUpdateListingStatus(listing.id, ListingStatus.REJECTED)}>Reject</Button>
                            </>
                         )}
                         {listing.status === ListingStatus.ACTIVE && (
                             <Button variant="warning" size="sm" onClick={() => handleUpdateListingStatus(listing.id, ListingStatus.PAUSED)}>Pause</Button>
                         )}
                         {listing.status === ListingStatus.PAUSED && (
                             <Button variant="success" size="sm" onClick={() => handleUpdateListingStatus(listing.id, ListingStatus.ACTIVE)}>Resume</Button>
                         )}
                         <Link to={`/listing/${listing.id}`}>
                            <Button variant="secondary" size="sm">View Details</Button>
                         </Link>
                    </div>
                </div>
            ))}
        </div>
    );


    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            
            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`${activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Pending ({pendingListings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('allListings')}
                        className={`${activeTab === 'allListings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        All Listings ({listings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Users ({users.length})
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'pending' && renderPendingListings()}
                {activeTab === 'users' && renderUserManagement()}
                {activeTab === 'allListings' && renderAllListings()}
            </div>

            {/* Rejection Modal */}
            <Modal
                isOpen={showRejectionModal}
                onClose={() => setShowRejectionModal(false)}
                title={`Reject Listing: ${currentListingToReject?.title || ''}`}
            >
                <div className="space-y-4">
                    <p>Please provide a reason for rejecting this listing (optional):</p>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Missing crucial information, violates terms of service..."
                    />
                    <div className="flex justify-end space-x-3">
                        <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleConfirmRejectListing}>Confirm Rejection</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboardPage;