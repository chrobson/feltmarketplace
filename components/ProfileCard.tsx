
import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';
import StarRating from './StarRating';
import Button from './Button';

interface ProfileCardProps {
  user: UserProfile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out p-6 text-center">
      <img
        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-500"
        src={user.profilePictureUrl}
        alt={user.username}
      />
      <h3 className="mt-4 text-2xl font-bold text-gray-900">{user.username}</h3>
      <p className="text-sm text-gray-500">{user.role}</p>
      <div className="mt-2 flex justify-center">
        <StarRating rating={user.starRating} readOnly />
        <span className="ml-2 text-sm text-gray-600">({user.ratingsCount} ratings)</span>
      </div>
      <p className="mt-3 text-gray-700 text-sm h-16 overflow-hidden text-ellipsis">{user.bio}</p>
      <div className="mt-4">
        <Link to={`/profile/${user.id}`}>
          <Button variant="primary" size="md">View Profile</Button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileCard;
