import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    mockListings, 
    mockUsers, 
    mockRatings, 
    addRating as apiAddRating // Renamed to avoid conflict
} from '../data/mockData';
import { Listing, UserProfile, Rating, ListingStatus, UserRole } from '../types';
import StarRating from '../components/StarRating';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { AuthContext } from '../App';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [player, setPlayer] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]); // Ratings for this listing/player
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal for player rating backer
  const [isRatePlayerModalOpen, setIsRatePlayerModalOpen] = useState(false);
  const [playerRatingScore, setPlayerRatingScore] = useState(5);
  const [playerRatingComment, setPlayerRatingComment] = useState("");
  const [playerRatingProfessionalism, setPlayerRatingProfessionalism] = useState(5);
  const [playerRatingTransparency, setPlayerRatingTransparency] = useState(5);
  const [playerRatingCommunication, setPlayerRatingCommunication] = useState(5);


  // Modal for player rating a backer
  const [isRateBackerModalOpen, setIsRateBackerModalOpen] = useState(false);
  const [backerSearchTerm, setBackerSearchTerm] = useState('');
  const [foundBackers, setFoundBackers] = useState<UserProfile[]>([]);
  const [selectedBackerToRate, setSelectedBackerToRate] = useState<UserProfile | null>(null);
  const [backerRatingPaymentSpeed, setBackerRatingPaymentSpeed] = useState(5);
  const [backerRatingCommunication, setBackerRatingCommunication] = useState(5);
  const [backerRatingComment, setBackerRatingComment] = useState("");


  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const foundListing = mockListings.find(l => l.id === id);
      if (foundListing) {
        setListing(foundListing);
        const foundPlayer = mockUsers.find(u => u.id === foundListing.playerId);
        setPlayer(foundPlayer || null);
        // Ratings where the player of this listing is the ratee
        const listingPlayerRatings = mockRatings.filter(r => r.listingId === id && r.rateeId === foundListing.playerId);
        setRatings(listingPlayerRatings);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleCommit = () => {
    if (!auth?.currentUser) {
      alert("Please login to commit to a listing.");
      return;
    }
    alert(`You've expressed interest in "${listing?.title}". The player will be notified. (This is a mock action)`);
    navigate(`/messages?listingId=${listing?.id}&recipientId=${player?.id}`);
  };

  const handleOpenRatePlayerModal = () => {
    if (!auth?.currentUser) {
        alert("Please login to rate.");
        return;
    }
    setPlayerRatingScore(5);
    setPlayerRatingComment("");
    setPlayerRatingProfessionalism(5);
    setPlayerRatingTransparency(5);
    setPlayerRatingCommunication(5);
    setIsRatePlayerModalOpen(true);
  };

  const handleRatePlayerSubmit = () => {
    if (!auth?.currentUser || !listing || !player) return;

    const newRating: Rating = {
      id: `rating-${Date.now()}`,
      raterId: auth.currentUser.id, // Current user (backer) rates the player
      rateeId: player.id, 
      listingId: listing.id,
      score: playerRatingScore,
      comment: playerRatingComment,
      date: new Date().toISOString(),
      aspects: {
        professionalism: playerRatingProfessionalism,
        transparency: playerRatingTransparency,
        communication: playerRatingCommunication,
      }
    };
    apiAddRating(newRating); 
    setRatings(prev => [...prev, newRating]);
    setIsRatePlayerModalOpen(false);
    alert("Rating submitted for player!");
  };

  const handleOpenRateBackerModal = () => {
    setBackerSearchTerm('');
    setFoundBackers([]);
    setSelectedBackerToRate(null);
    setBackerRatingComment('');
    setBackerRatingPaymentSpeed(5);
    setBackerRatingCommunication(5);
    setIsRateBackerModalOpen(true);
  };
  
  const handleSearchBacker = () => {
    if (!backerSearchTerm.trim()) {
        setFoundBackers([]);
        return;
    }
    const results = mockUsers.filter(u => 
        u.role === UserRole.BACKER && 
        u.username.toLowerCase().includes(backerSearchTerm.toLowerCase())
    );
    setFoundBackers(results);
  };

  const handleRateBackerSubmit = () => {
    if (!auth?.currentUser || !listing || !selectedBackerToRate) {
        alert("Error: Missing information to submit rating.");
        return;
    }
    const newRating: Rating = {
        id: `rating-backer-${Date.now()}`,
        raterId: auth.currentUser.id, // Player is rating
        rateeId: selectedBackerToRate.id, // Backer being rated
        listingId: listing.id,
        score: Math.round((backerRatingPaymentSpeed + backerRatingCommunication) / 2), // Example overall score
        comment: backerRatingComment,
        date: new Date().toISOString(),
        aspects: {
            paymentSpeed: backerRatingPaymentSpeed,
            communication: backerRatingCommunication,
        }
    };
    apiAddRating(newRating);
    // Optionally, store this rating differently or add to a different list if needed
    // For now, it goes into the global mockRatings. The backer's profile might show it.
    setIsRateBackerModalOpen(false);
    alert(`Rating submitted for backer ${selectedBackerToRate.username}!`);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner text="Loading listing details..." /></div>;
  }

  if (!listing || !player) {
    return <div className="text-center py-10 text-xl text-red-500">Listing not found.</div>;
  }

  const costPerPercent = listing.stakingDetails ? (listing.stakingDetails.totalBuyIn * listing.stakingDetails.markup) / 100 : null;
  
  // Has the current user (backer) already rated this player for this listing?
  const alreadyRatedThisPlayerForListing = ratings.some(r => r.raterId === auth?.currentUser?.id && r.rateeId === player.id && r.listingId === listing.id);
  
  // Is the current user the owner of this completed listing?
  const isOwnerOfCompletedListing = auth?.currentUser?.id === player.id && listing.status === ListingStatus.COMPLETED;
  
  // Has current user (player) already rated a specific backer for this listing? (More complex check, simplified for now)
  // This would ideally check against a list of (listingId, raterId(player), rateeId(backer)) tuples.
  // For MVP, we'll just allow rating one backer per completed listing from this UI. A full system would list backers involved.
  const hasPlayerRatedAnyBackerForThisListing = mockRatings.some(
      r => r.listingId === listing.id && r.raterId === player.id && mockUsers.find(u => u.id === r.rateeId)?.role === UserRole.BACKER
  );


  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 lg:p-10 space-y-8">
      {/* Header Section */}
      <div className="border-b pb-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    listing.status === ListingStatus.ACTIVE ? 'bg-green-100 text-green-800' : 
                    listing.status === ListingStatus.PENDING_APPROVAL ? 'bg-orange-100 text-orange-800' :
                    listing.status === ListingStatus.PAUSED ? 'bg-yellow-100 text-yellow-800' :
                    listing.status === ListingStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800' 
                }`}>
                    {listing.status}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">{listing.title}</h1>
                <p className="text-lg text-blue-600 font-semibold">{listing.listingType}</p>
            </div>
            {listing.isFeatured && (
                <div className="mt-4 md:mt-0 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md font-semibold shadow">
                    ⭐ Featured Listing
                </div>
            )}
        </div>
        <p className="text-sm text-gray-500 mt-2">Posted on: {new Date(listing.datePosted).toLocaleDateString()}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Listing Details) */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{listing.description}</p>
          </div>

          {listing.listingType === 'Staking' && listing.stakingDetails && costPerPercent !== null && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">Staking Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                <p><strong>Game Type:</strong> {listing.stakingDetails.gameType}</p>
                <p><strong>Event/Venue:</strong> {listing.stakingDetails.eventVenueDetails}</p>
                <p><strong>Total Buy-In:</strong> ${listing.stakingDetails.totalBuyIn.toLocaleString()}</p>
                <p><strong>Markup:</strong> {listing.stakingDetails.markup}x</p>
                <p><strong>1% Cost:</strong> ${costPerPercent.toFixed(2)}</p>
                <p><strong>For Sale:</strong> {listing.stakingDetails.percentageForSale}%</p>
                <p><strong>Min Purchase:</strong> {listing.stakingDetails.minPurchasePercentage}%</p>
                <p><strong>Max Purchase:</strong> {listing.stakingDetails.maxPurchasePercentage}%</p>
              </div>
            </div>
          )}

          {listing.listingType === 'Coaching' && listing.coachingDetails && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">Coaching Details</h2>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p><strong>Service Type:</strong> {listing.coachingDetails.serviceType}</p>
                {listing.coachingDetails.pricePerHour && <p><strong>Price:</strong> ${listing.coachingDetails.pricePerHour}/hour</p>}
                {listing.coachingDetails.pricePerSession && <p><strong>Price:</strong> ${listing.coachingDetails.pricePerSession}/session</p>}
                {listing.coachingDetails.sessionDuration && <p><strong>Session Duration:</strong> {listing.coachingDetails.sessionDuration}</p>}
              </div>
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Payment Methods Accepted</h2>
            <div className="flex flex-wrap gap-2">
              {listing.paymentMethodsAccepted.map(method => (
                <span key={method} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{method}</span>
              ))}
            </div>
             <p className="text-xs text-gray-500 mt-2">(Payments are handled off-site between users)</p>
          </div>
        </div>

        {/* Right Column (Player Info & Actions) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Player Information</h2>
            <div className="flex items-center space-x-4 mb-4">
              <img src={player.profilePictureUrl} alt={player.username} className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
              <div>
                <Link to={`/profile/${player.id}`} className="text-xl font-bold text-blue-600 hover:underline">{player.username}</Link>
                <StarRating rating={player.starRating} readOnly />
                <span className="text-sm text-gray-500">({player.ratingsCount} ratings)</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1"><strong>Preferred Games:</strong> {player.preferredGames.join(', ')}</p>
            {player.verificationLinks?.hendonMob && (
                <a href={player.verificationLinks.hendonMob} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline block">View Hendon Mob</a>
            )}
            <Link to={`/profile/${player.id}`} className="mt-3 block">
                <Button variant="secondary" size="sm" className="w-full">View Full Profile</Button>
            </Link>
          </div>

          {auth?.currentUser && auth.currentUser.id !== player.id && listing.status === ListingStatus.ACTIVE && (
            <div className="bg-green-50 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-green-700 mb-3">Interested?</h2>
                <Button onClick={handleCommit} variant="success" size="lg" className="w-full">
                    Commit to Listing / Message Player
                </Button>
            </div>
          )}
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="mt-10 pt-6 border-t">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ratings & Reviews for Player ({ratings.length})</h2>
        {/* Backer rating Player */}
        {auth?.currentUser && auth.currentUser.id !== player.id && listing.status !== ListingStatus.PENDING_APPROVAL && !alreadyRatedThisPlayerForListing && (
           <Button onClick={handleOpenRatePlayerModal} variant="primary" className="mb-6">
            Rate this Player for this Listing
          </Button>
        )}
         {alreadyRatedThisPlayerForListing && (
            <p className="mb-6 text-sm text-green-600 bg-green-50 p-3 rounded-md">Thank you for your review of this player for this listing!</p>
        )}

        {/* Player rating Backer */}
        {isOwnerOfCompletedListing && !hasPlayerRatedAnyBackerForThisListing && (
            <Button onClick={handleOpenRateBackerModal} variant="primary" className="mb-6 ml-2">
                Rate a Backer for this Deal
            </Button>
        )}
        {isOwnerOfCompletedListing && hasPlayerRatedAnyBackerForThisListing && (
             <p className="mb-6 text-sm text-green-600 bg-green-50 p-3 rounded-md">You've rated a backer for this completed deal.</p>
        )}


        {ratings.length > 0 ? (
          <div className="space-y-6">
            {ratings.map(rating => {
              const rater = mockUsers.find(u => u.id === rating.raterId);
              return (
                <div key={rating.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <img src={rater?.profilePictureUrl || 'https://picsum.photos/seed/default/50'} alt={rater?.username} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <p className="font-semibold text-gray-800">{rater?.username || 'Anonymous'}</p>
                      <StarRating rating={rating.score} readOnly size="sm" />
                    </div>
                    <span className="ml-auto text-xs text-gray-500">{new Date(rating.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{rating.comment}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No ratings yet for this player on this listing.</p>
        )}
      </div>

      {/* Modal for Backer to Rate Player */}
      <Modal isOpen={isRatePlayerModalOpen} onClose={() => setIsRatePlayerModalOpen(false)} title={`Rate ${player.username} for "${listing.title}"`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating:</label>
            <StarRating rating={playerRatingScore} onRate={setPlayerRatingScore} size="lg" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professionalism:</label>
            <StarRating rating={playerRatingProfessionalism} onRate={setPlayerRatingProfessionalism} size="md" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transparency:</label>
            <StarRating rating={playerRatingTransparency} onRate={setPlayerRatingTransparency} size="md" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Communication:</label>
            <StarRating rating={playerRatingCommunication} onRate={setPlayerRatingCommunication} size="md" />
          </div>
          <div>
            <label htmlFor="playerRatingComment" className="block text-sm font-medium text-gray-700">Your Comment:</label>
            <textarea
              id="playerRatingComment"
              value={playerRatingComment}
              onChange={(e) => setPlayerRatingComment(e.target.value)}
              rows={3}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your experience..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsRatePlayerModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRatePlayerSubmit}>Submit Rating</Button>
          </div>
        </div>
      </Modal>

    {/* Modal for Player to Rate Backer */}
    <Modal isOpen={isRateBackerModalOpen} onClose={() => setIsRateBackerModalOpen(false)} title={`Rate a Backer for "${listing.title}"`}>
        <div className="space-y-4">
            <div>
                <label htmlFor="backerSearch" className="block text-sm font-medium text-gray-700">Search Backer Username:</label>
                <div className="flex space-x-2 mt-1">
                    <input 
                        type="text" 
                        id="backerSearch" 
                        value={backerSearchTerm} 
                        onChange={(e) => setBackerSearchTerm(e.target.value)}
                        className="flex-grow shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button onClick={handleSearchBacker} variant="secondary" size="sm">Search</Button>
                </div>
            </div>
            {foundBackers.length > 0 && !selectedBackerToRate && (
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Select a backer:</p>
                    {foundBackers.map(b => (
                        <div key={b.id} onClick={() => setSelectedBackerToRate(b)} className="p-2 hover:bg-blue-100 cursor-pointer rounded-md text-sm flex items-center">
                           <img src={b.profilePictureUrl} alt={b.username} className="w-6 h-6 rounded-full mr-2"/> {b.username}
                        </div>
                    ))}
                </div>
            )}
            {selectedBackerToRate && (
                <div className="p-2 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-700">Rating: {selectedBackerToRate.username}</p>
                </div>
            )}

            {selectedBackerToRate && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Speed:</label>
                        <StarRating rating={backerRatingPaymentSpeed} onRate={setBackerRatingPaymentSpeed} size="lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Communication:</label>
                        <StarRating rating={backerRatingCommunication} onRate={setBackerRatingCommunication} size="lg" />
                    </div>
                    <div>
                        <label htmlFor="backerRatingComment" className="block text-sm font-medium text-gray-700">Comment:</label>
                        <textarea
                            id="backerRatingComment"
                            value={backerRatingComment}
                            onChange={(e) => setBackerRatingComment(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Share your experience with this backer..."
                        />
                    </div>
                </>
            )}
            <div className="flex justify-end space-x-3 pt-2">
                <Button variant="secondary" onClick={() => setIsRateBackerModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleRateBackerSubmit} disabled={!selectedBackerToRate}>Submit Backer Rating</Button>
            </div>
        </div>
    </Modal>

    </div>
  );
};

export default ListingDetailPage;