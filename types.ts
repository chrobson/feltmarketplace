export enum UserRole {
  PLAYER = 'Player',
  BACKER = 'Backer',
  ADMIN = 'Admin',
}

export interface UserProfile {
  id: string;
  username: string;
  profilePictureUrl: string;
  bio: string;
  starRating: number;
  ratingsCount: number;
  verificationLinks?: {
    hendonMob?: string;
    sharkScope?: string;
    twitter?: string;
    instagram?: string;
  };
  preferredGames: string[]; // e.g., "NLH Tournaments", "PLO Cash"
  role: UserRole;
}

export interface Rating {
  id: string;
  raterId: string; // User ID of the rater
  rateeId: string; // User ID of the one being rated
  listingId: string;
  score: number; // 1-5
  comment: string;
  date: string; // ISO date string
  // Aspects can vary based on who is rating whom
  aspects?: {
    // Player rating a Backer
    paymentSpeed?: number;    
    communication?: number;   // Communication can be rated by both

    // Backer rating a Player
    professionalism?: number; 
    transparency?: number;    
    // overallExperience is captured by the main 'score'
  };
}

export enum ListingType {
  STAKING = 'Staking',
  COACHING = 'Coaching',
  OTHER = 'Other',
}

export interface StakingDetails {
  gameType: string; // Tournament, Cash Game, Online Series
  eventVenueDetails: string;
  totalBuyIn: number;
  markup: number; // e.g., 1.2
  percentageForSale: number; // e.g., 50%
  minPurchasePercentage: number; // e.g., 1%
  maxPurchasePercentage: number; // e.g., 10%
}

export interface CoachingDetails {
  serviceType: string; // Coaching, Hand History Review
  pricePerHour?: number;
  pricePerSession?: number;
  sessionDuration?: string; // e.g., "60 minutes"
}

export enum ListingStatus {
  PENDING_APPROVAL = 'Pending Approval',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled', // Useful for player-initiated cancellations
}

export interface Listing {
  id: string;
  playerId: string; // User ID of the player/seller
  title: string;
  listingType: ListingType;
  description: string;
  status: ListingStatus;
  datePosted: string; // ISO date string
  paymentMethodsAccepted: string[]; // e.g., "PayPal", "Crypto" (handled off-site)
  stakingDetails?: StakingDetails;
  coachingDetails?: CoachingDetails;
  isFeatured?: boolean;
  rejectionReason?: string; // Optional reason if status is REJECTED
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO date string
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: Message;
  listingId?: string; // Optional: link conversation to a listing
}

// For mock auth context
export interface AuthContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loginAsPlayer: () => void;
  loginAsBacker: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
}