import React from 'react';
import { Link } from 'react-router-dom';
import { Listing, ListingType, UserProfile } from '../types';
import StarRating from './StarRating';
import Button from './Button';
import { mockUsers } from '../data/mockData'; // For fetching player info

interface ListingRowItemProps {
  listing: Listing;
}

const ListingRowItem: React.FC<ListingRowItemProps> = ({ listing }) => {
  const player = mockUsers.find(u => u.id === listing.playerId);

  const calculateCostPerPercent = () => {
    if (listing.listingType === ListingType.STAKING && listing.stakingDetails) {
      const { totalBuyIn, markup } = listing.stakingDetails;
      return (totalBuyIn * markup) / 100;
    }
    return null;
  };

  const costPerPercent = calculateCostPerPercent();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Pending Approval': return 'text-orange-600 bg-orange-100';
      case 'Paused': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-blue-600 bg-blue-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-200">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start">
        <div className="flex-grow mb-4 sm:mb-0 sm:mr-4">
          <div className="flex items-center mb-1">
             {listing.isFeatured && (
                <span className="mr-2 text-xs font-semibold bg-yellow-400 text-yellow-800 px-2 py-0.5 rounded-full">Featured</span>
            )}
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                {listing.status}
            </span>
          </div>
          <Link to={`/listing/${listing.id}`} className="block text-lg sm:text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
            {listing.title}
          </Link>
          <p className="text-sm text-blue-500 font-medium mb-1">{listing.listingType}</p>
          
          {player && (
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <img className="h-5 w-5 rounded-full object-cover mr-1.5" src={player.profilePictureUrl} alt={player.username} />
              <Link to={`/profile/${player.id}`} className="hover:text-gray-800 hover:underline">{player.username}</Link>
              <span className="mx-1">·</span>
              <StarRating rating={player.starRating} size="sm" readOnly />
               <span className="ml-1">({player.ratingsCount})</span>
            </div>
          )}
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{listing.description}</p>
        </div>

        <div className="flex-shrink-0 sm:w-1/3 sm:max-w-xs text-sm text-gray-700 space-y-1">
          {listing.listingType === ListingType.STAKING && listing.stakingDetails && costPerPercent !== null && (
            <>
              <p><span className="font-semibold">Buy-in:</span> ${listing.stakingDetails.totalBuyIn.toLocaleString()}</p>
              <p><span className="font-semibold">Markup:</span> {listing.stakingDetails.markup}x</p>
              <p className="text-blue-600 font-semibold">1% Cost: ${costPerPercent.toFixed(2)}</p>
              <p><span className="font-semibold">For Sale:</span> {listing.stakingDetails.percentageForSale}%</p>
            </>
          )}
          {listing.listingType === ListingType.COACHING && listing.coachingDetails && (
            <>
              <p><span className="font-semibold">Service:</span> {listing.coachingDetails.serviceType}</p>
              {listing.coachingDetails.pricePerHour && <p className="text-blue-600 font-semibold">Rate: ${listing.coachingDetails.pricePerHour}/hr</p>}
              {listing.coachingDetails.pricePerSession && <p className="text-blue-600 font-semibold">Rate: ${listing.coachingDetails.pricePerSession}/session</p>}
            </>
          )}
          <div className="pt-2">
            <Link to={`/listing/${listing.id}`}>
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingRowItem;
