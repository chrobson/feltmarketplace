
import React from 'react';
import { Link } from 'react-router-dom';
import { Listing, ListingType, UserProfile } from '../types';
import StarRating from './StarRating'; // Assuming StarRating component exists
import Button from './Button'; // Assuming Button component exists
import { mockUsers } from '../data/mockData'; // For fetching player info

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const player = mockUsers.find(u => u.id === listing.playerId);

  const calculateCostPerPercent = () => {
    if (listing.listingType === ListingType.STAKING && listing.stakingDetails) {
      const { totalBuyIn, markup } = listing.stakingDetails;
      return (totalBuyIn * markup) / 100;
    }
    return null;
  };

  const costPerPercent = calculateCostPerPercent();

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      {listing.isFeatured && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-bl-lg z-10">
          Featured
        </div>
      )}
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          {/* Placeholder for listing image, or player image if no listing image */}
          <img className="h-48 w-full object-cover md:w-48" src={player?.profilePictureUrl || `https://picsum.photos/seed/${listing.id}/400/300`} alt={listing.title} />
        </div>
        <div className="p-6 flex flex-col justify-between flex-grow">
          <div>
            <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">{listing.listingType}</div>
            <Link to={`/listing/${listing.id}`} className="block mt-1 text-xl leading-tight font-bold text-gray-900 hover:text-blue-700 transition-colors">
              {listing.title}
            </Link>
            {player && (
              <div className="mt-2 flex items-center">
                <img className="h-8 w-8 rounded-full object-cover mr-2" src={player.profilePictureUrl} alt={player.username} />
                <div>
                  <Link to={`/profile/${player.id}`} className="text-sm text-gray-600 hover:text-gray-900">{player.username}</Link>
                  <StarRating rating={player.starRating} size="sm" readOnly />
                </div>
              </div>
            )}
            <p className="mt-3 text-gray-600 text-sm truncate-3-lines h-[3.75rem]">{listing.description}</p>
          </div>
          
          <div className="mt-4">
            {listing.listingType === ListingType.STAKING && listing.stakingDetails && costPerPercent !== null && (
              <div className="text-sm text-gray-700">
                <p><span className="font-semibold">Buy-in:</span> ${listing.stakingDetails.totalBuyIn.toLocaleString()}</p>
                <p><span className="font-semibold">Markup:</span> {listing.stakingDetails.markup}x</p>
                <p><span className="font-semibold">1% Cost:</span> ${costPerPercent.toFixed(2)}</p>
                <p><span className="font-semibold">For Sale:</span> {listing.stakingDetails.percentageForSale}%</p>
              </div>
            )}
            {listing.listingType === ListingType.COACHING && listing.coachingDetails && (
              <div className="text-sm text-gray-700">
                <p><span className="font-semibold">Service:</span> {listing.coachingDetails.serviceType}</p>
                {listing.coachingDetails.pricePerHour && <p><span className="font-semibold">Rate:</span> ${listing.coachingDetails.pricePerHour}/hr</p>}
                {listing.coachingDetails.pricePerSession && <p><span className="font-semibold">Rate:</span> ${listing.coachingDetails.pricePerSession}/session</p>}
              </div>
            )}
            <div className="mt-4">
              <Link to={`/listing/${listing.id}`}>
                <Button variant="primary" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
