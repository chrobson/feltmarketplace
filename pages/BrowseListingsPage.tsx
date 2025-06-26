import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect
import { mockListings } from '../data/mockData';
import { Listing, ListingType } from '../types';
import ListingRowItem from '../components/ListingRowItem';
import LoadingSpinner from '../components/LoadingSpinner'; 

const BrowseListingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState<ListingType | 'ALL'>('ALL');
  const [gameFilter, setGameFilter] = useState<string>('ALL');
  const [buyInFilter, setBuyInFilter] = useState<'ALL' | 'LOW' | 'MID' | 'HIGH'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'popularity'>('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedListings, setDisplayedListings] = useState<Listing[]>([]); // State for listings to render

  const gameTypes = useMemo(() => {
    const allGames = new Set<string>();
    mockListings.forEach(l => {
      if (l.stakingDetails?.gameType) allGames.add(l.stakingDetails.gameType.split(" ")[0]); 
      if (l.coachingDetails?.serviceType) allGames.add(l.coachingDetails.serviceType.split(" ")[0]);
    });
    return ['ALL', ...Array.from(allGames)];
  }, []); // mockListings is stable within component lifecycle here


  // Memoize the filtering and sorting logic
  const processedListings = useMemo(() => {
    let listings = mockListings.filter(l => l.status === 'Active' || l.status === 'Pending Approval');

    if (searchTerm) {
      listings = listings.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (listingTypeFilter !== 'ALL') {
      listings = listings.filter(l => l.listingType === listingTypeFilter);
    }

    if (gameFilter !== 'ALL') {
        listings = listings.filter(l => 
            (l.stakingDetails?.gameType && l.stakingDetails.gameType.toLowerCase().includes(gameFilter.toLowerCase())) ||
            (l.coachingDetails?.serviceType && l.coachingDetails.serviceType.toLowerCase().includes(gameFilter.toLowerCase()))
        );
    }
    
    if (buyInFilter !== 'ALL' && listingTypeFilter === ListingType.STAKING) {
        listings = listings.filter(l => {
            const buyIn = l.stakingDetails?.totalBuyIn;
            if (buyIn === undefined) return false;
            if (buyInFilter === 'LOW') return buyIn <= 100;
            if (buyInFilter === 'MID') return buyIn > 100 && buyIn <= 1000;
            if (buyInFilter === 'HIGH') return buyIn > 1000;
            return true;
        });
    }

    // Sorting
    if (sortBy === 'newest') {
      listings.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
    }
    // Add more sophisticated sorting for 'rating' (player rating) or 'popularity' if data available

    return listings;
  }, [searchTerm, listingTypeFilter, gameFilter, buyInFilter, sortBy]);


  // Effect to simulate loading and update displayed listings
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDisplayedListings(processedListings);
      setIsLoading(false);
    }, 300); // Simulate API delay

    return () => clearTimeout(timer); // Cleanup timer
  }, [processedListings]); // Rerun when processedListings changes


  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Browse Listings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by keyword..."
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-1 md:col-span-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search listings by keyword"
          />
          <select
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={listingTypeFilter}
            onChange={(e) => setListingTypeFilter(e.target.value as ListingType | 'ALL')}
            aria-label="Filter by listing type"
          >
            <option value="ALL">All Listing Types</option>
            {Object.values(ListingType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
            aria-label="Filter by game type"
          >
            {gameTypes.map(game => (
              <option key={game} value={game}>{game === 'ALL' ? 'All Games' : game}</option>
            ))}
          </select>
          {listingTypeFilter === ListingType.STAKING && (
            <select
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={buyInFilter}
                onChange={(e) => setBuyInFilter(e.target.value as 'ALL' | 'LOW' | 'MID' | 'HIGH')}
                aria-label="Filter by buy-in range for staking"
            >
                <option value="ALL">All Buy-ins</option>
                <option value="LOW">Low (≤ $100)</option>
                <option value="MID">Mid ($101 - $1000)</option>
                <option value="HIGH">High (&gt; $1000)</option>
            </select>
          )}
          <select
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating' | 'popularity')}
            aria-label="Sort listings"
          >
            <option value="newest">Sort by Newest</option>
            {/* <option value="rating">Sort by Player Rating</option> */}
            {/* <option value="popularity">Sort by Popularity</option> */}
          </select>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner text="Fetching listings..." />
        </div>
      ) : displayedListings.length > 0 ? (
        <div className="space-y-4">
          {displayedListings.map(listing => (
            <ListingRowItem key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-xl font-semibold text-gray-700">No listings found.</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseListingsPage;