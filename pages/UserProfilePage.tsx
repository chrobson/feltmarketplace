import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    mockUsers, 
    mockListings as initialMockListings, 
    mockRatings,
    updateListingStatus,
    deleteListing as apiDeleteListing 
} from '../data/mockData';
import { UserProfile, Listing, Rating, UserRole, ListingStatus } from '../types';
import StarRating from '../components/StarRating';
import ListingCard from '../components/ListingCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal'; // Import Modal
import { AuthContext } from '../App';

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Publicly visible listings (Active, Completed, Pending for others to see)
  const [userPublicListings, setUserPublicListings] = useState<Listing[]>([]);
  // All listings for management by the owner
  const [myManagedListings, setMyManagedListings] = useState<Listing[]>([]);

  const [userRatingsReceived, setUserRatingsReceived] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalAction, setConfirmModalAction] = useState<(() => void) | null>(null);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');

  const isOwnProfile = auth?.currentUser?.id === user?.id;

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const foundUser = mockUsers.find(u => u.id === id);
      if (foundUser) {
        setUser(foundUser);
        
        // Listings for public view
        setUserPublicListings(
            initialMockListings.filter(l => 
                l.playerId === id && 
                (l.status === ListingStatus.ACTIVE || l.status === ListingStatus.COMPLETED || l.status === ListingStatus.PENDING_APPROVAL)
            )
        );
        
        // Listings for own management view
        if (auth?.currentUser?.id === foundUser.id && foundUser.role === UserRole.PLAYER) {
            setMyManagedListings(initialMockListings.filter(l => l.playerId === id));
        }

        setUserRatingsReceived(mockRatings.filter(r => r.rateeId === id));
      }
      setIsLoading(false);
    }, 500);
  }, [id, auth?.currentUser]);

  const refreshManagedListings = () => {
    if (user && auth?.currentUser?.id === user.id && user.role === UserRole.PLAYER) {
        setMyManagedListings(initialMockListings.filter(l => l.playerId === user.id));
         setUserPublicListings( // Also refresh public listings as their status might change
            initialMockListings.filter(l => 
                l.playerId === user.id && 
                (l.status === ListingStatus.ACTIVE || l.status === ListingStatus.COMPLETED || l.status === ListingStatus.PENDING_APPROVAL)
            )
        );
    }
  };

  const handleListingAction = (listingId: string, newStatus: ListingStatus) => {
    updateListingStatus(listingId, newStatus);
    refreshManagedListings();
  };

  const handleDeleteListing = (listingId: string) => {
    apiDeleteListing(listingId);
    refreshManagedListings();
    setShowConfirmModal(false);
  };

  const openConfirmationModal = (listingId: string, title: string, message: string, action: 'delete') => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    if (action === 'delete') {
        setConfirmModalAction(() => () => handleDeleteListing(listingId));
    }
    setShowConfirmModal(true);
  };
  
  const handleEditListing = (listingId: string) => {
    alert(`Edit functionality for listing ${listingId} is not yet implemented. This would typically navigate to a pre-filled creation form.`);
    // Future: navigate(`/create-listing?edit=${listingId}`);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner text="Loading profile..." /></div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-xl text-red-500">User profile not found.</div>;
  }


  const renderManageMyListings = () => {
    if (!isOwnProfile || user.role !== UserRole.PLAYER) return null;

    return (
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 mt-8 pb-2 border-b-2 border-purple-400">
          Manage My Listings ({myManagedListings.length})
        </h2>
        {myManagedListings.length > 0 ? (
          <div className="space-y-4">
            {myManagedListings.map(listing => (
              <div key={listing.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-600">{listing.title}</h3>
                        <p className="text-sm text-gray-500">Status: <span className={`font-medium ${
                            listing.status === ListingStatus.ACTIVE ? 'text-green-600' : 
                            listing.status === ListingStatus.PENDING_APPROVAL ? 'text-orange-500' :
                            listing.status === ListingStatus.PAUSED ? 'text-yellow-600' :
                            listing.status === ListingStatus.COMPLETED ? 'text-blue-500' :
                            'text-red-500' 
                        }`}>{listing.status}</span>
                        </p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex flex-wrap gap-2 items-center">
                        <Button variant="secondary" size="sm" onClick={() => handleEditListing(listing.id)}>Edit</Button>
                        {listing.status === ListingStatus.ACTIVE && (
                            <Button variant="warning" size="sm" onClick={() => handleListingAction(listing.id, ListingStatus.PAUSED)}>Pause</Button>
                        )}
                        {listing.status === ListingStatus.PAUSED && (
                            <Button variant="success" size="sm" onClick={() => handleListingAction(listing.id, ListingStatus.ACTIVE)}>Resume</Button>
                        )}
                        { (listing.status === ListingStatus.ACTIVE || listing.status === ListingStatus.PAUSED) && (
                             <Button variant="primary" size="sm" onClick={() => handleListingAction(listing.id, ListingStatus.COMPLETED)}>Mark Complete</Button>
                        )}
                        {(listing.status === ListingStatus.PENDING_APPROVAL || listing.status === ListingStatus.PAUSED || listing.status === ListingStatus.REJECTED || listing.status === ListingStatus.CANCELLED) && (
                           <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => openConfirmationModal(listing.id, `Delete Listing: ${listing.title}`, "Are you sure you want to delete this listing? This action cannot be undone.", 'delete')}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
                 {listing.status === ListingStatus.COMPLETED && (
                    <p className="text-xs text-green-700 mt-2">This listing is completed. You can rate backers involved via the listing detail page.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You have not created any listings yet.</p>
        )}
      </section>
    );
  };


  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border-b pb-6 mb-6">
        <img 
          src={user.profilePictureUrl} 
          alt={user.username} 
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-500 shadow-md"
        />
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{user.username}</h1>
          <p className="text-md text-gray-500 mb-2">{user.role}</p>
          <div className="flex items-center justify-center sm:justify-start mb-3">
            <StarRating rating={user.starRating} readOnly />
            <span className="ml-2 text-sm text-gray-600">({user.ratingsCount} ratings)</span>
          </div>
          {isOwnProfile && (
            <Button variant="secondary" size="sm" onClick={() => alert("Edit profile clicked (functionality not implemented)")}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Bio and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Bio</h2>
          <p className="text-gray-600 whitespace-pre-line leading-relaxed">{user.bio || "No bio provided."}</p>
        </div>
        <div className="md:col-span-1 space-y-3 bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Details</h3>
          <p><strong>Preferred Games:</strong> {user.preferredGames.join(', ') || "Not specified"}</p>
          {user.verificationLinks?.hendonMob && (
            <p className="truncate"><strong>HendonMob:</strong> <a href={user.verificationLinks.hendonMob} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Profile</a></p>
          )}
          {user.verificationLinks?.sharkScope && (
            <p className="truncate"><strong>SharkScope:</strong> <a href={user.verificationLinks.sharkScope} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Profile</a></p>
          )}
          {user.verificationLinks?.twitter && (
            <p><strong>Twitter:</strong> <a href={user.verificationLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@{user.verificationLinks.twitter.split('/').pop()}</a></p>
          )}
           {user.verificationLinks?.instagram && (
            <p><strong>Instagram:</strong> <a href={user.verificationLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Profile</a></p>
          )}
        </div>
      </div>
      
      {/* Public Listings by Player */}
      {user.role === UserRole.PLAYER && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 mt-6 pb-2 border-b-2 border-blue-300">
            {isOwnProfile ? "My Public Listings" : `Listings by ${user.username}`} ({userPublicListings.length})
          </h2>
          {userPublicListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPublicListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{isOwnProfile ? "You have no public listings currently." : "This player has no public listings."}</p>
          )}
        </section>
      )}

      {/* Render Manage My Listings section if applicable */}
      {renderManageMyListings()}


      {/* Ratings Received */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 mt-6 pb-2 border-b-2 border-green-300">
          Ratings Received ({userRatingsReceived.length})
        </h2>
        {userRatingsReceived.length > 0 ? (
          <div className="space-y-4">
            {userRatingsReceived.slice(0, 5).map(rating => { // Show recent 5
              const rater = mockUsers.find(u => u.id === rating.raterId);
              return (
                <div key={rating.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex items-start mb-1">
                    <img src={rater?.profilePictureUrl || 'https://picsum.photos/seed/default/40'} alt={rater?.username || 'Rater'} className="w-10 h-10 rounded-full mr-3"/>
                    <div>
                      <p className="font-semibold text-gray-800">{rater?.username || 'Anonymous'} ({rater?.role})</p>
                      <StarRating rating={rating.score} readOnly size="sm" />
                    </div>
                    <span className="ml-auto text-xs text-gray-500">{new Date(rating.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 text-sm italic">"{rating.comment}"</p>
                </div>
              );
            })}
            {userRatingsReceived.length > 5 && (
              <Button variant="secondary" size="sm" onClick={() => alert("View all ratings (not implemented)")} className="mt-2">
                View All Ratings
              </Button>
            )}
          </div>
        ) : (
          <p className="text-gray-500">This user has not received any ratings yet.</p>
        )}
      </section>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title={confirmModalTitle}>
        <p className="text-gray-700 mb-6">{confirmModalMessage}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if(confirmModalAction) confirmModalAction(); }}>Confirm</Button>
        </div>
      </Modal>

    </div>
  );
};

export default UserProfilePage;