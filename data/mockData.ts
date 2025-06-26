import { UserProfile, UserRole, Listing, ListingType, ListingStatus, Rating, Message, Conversation } from '../types';
import { MOCK_PLAYER_PROFILE, MOCK_BACKER_PROFILE, MOCK_ADMIN_PROFILE, MOCK_PLAYER_USER_ID, MOCK_BACKER_USER_ID } from '../constants';

export let mockUsers: UserProfile[] = [ // Changed from const to let to allow modification of user ratings
  MOCK_PLAYER_PROFILE,
  MOCK_BACKER_PROFILE,
  MOCK_ADMIN_PROFILE,
  {
    id: "player2",
    username: "CardSharkGrrl",
    profilePictureUrl: "https://picsum.photos/seed/player2/200",
    bio: "PLO specialist, crushing online cash games. Offering advanced PLO coaching.",
    starRating: 4.9,
    ratingsCount: 18,
    verificationLinks: { sharkScope: "https://www.sharkscope.com/#Player-Statistics//networks/Unknown/players/CardSharkGrrl" },
    preferredGames: ["PLO Cash", "Online Poker"],
    role: UserRole.PLAYER,
  },
  {
    id: "backer2",
    username: "HighRollerInvest",
    profilePictureUrl: "https://picsum.photos/seed/backer2/200",
    bio: "Looking for long-term staking arrangements with proven winners in high stakes MTTs.",
    starRating: 4.2, // Backers can also have ratings
    ratingsCount: 5, // Backers can also have ratings count
    preferredGames: ["High Stakes MTTs"],
    role: UserRole.BACKER,
  }
];

export let mockListings: Listing[] = [
  {
    id: "listing1",
    playerId: MOCK_PLAYER_USER_ID,
    title: "Staking for 2024 WSOP Main Event",
    listingType: ListingType.STAKING,
    description: "Selling action for the WSOP 2024 Main Event. Proven track record in deep stack tournaments. Includes regular updates throughout the event. Looking for serious backers.",
    status: ListingStatus.ACTIVE,
    datePosted: "2024-07-15T10:00:00Z",
    paymentMethodsAccepted: ["PayPal", "Crypto"],
    stakingDetails: {
      gameType: "Tournament",
      eventVenueDetails: "WSOP Main Event, Las Vegas",
      totalBuyIn: 10000,
      markup: 1.25,
      percentageForSale: 50,
      minPurchasePercentage: 1,
      maxPurchasePercentage: 10,
    },
    isFeatured: true,
  },
  {
    id: "listing2",
    playerId: "player2",
    title: "Advanced PLO Cash Game Coaching",
    listingType: ListingType.COACHING,
    description: "One-on-one PLO coaching for players looking to move up in stakes. Hand history reviews, GTO concepts, and mental game. Customized sessions based on your needs.",
    status: ListingStatus.ACTIVE,
    datePosted: "2024-07-10T14:30:00Z",
    paymentMethodsAccepted: ["Bank Transfer"],
    coachingDetails: {
      serviceType: "Coaching",
      pricePerHour: 150,
      sessionDuration: "60-90 minutes"
    },
  },
  {
    id: "listing3",
    playerId: MOCK_PLAYER_USER_ID,
    title: "NLH Mid-Stakes Tournament Coaching",
    listingType: ListingType.COACHING,
    description: "Coaching for NLH MTT players struggling to break through mid-stakes. Focus on preflop strategy, ICM, and final table play. Will review your database and provide actionable advice.",
    status: ListingStatus.PENDING_APPROVAL,
    datePosted: "2024-07-20T09:00:00Z",
    paymentMethodsAccepted: ["PayPal"],
    coachingDetails: {
      serviceType: "Hand History Review",
      pricePerSession: 200,
      sessionDuration: "2 hours (approx)"
    },
  },
  {
    id: "listing4",
    playerId: "player2",
    title: "Staking for Online High Roller Series",
    listingType: ListingType.STAKING,
    description: "Looking for backers for the upcoming 'Titans of Poker' online series. Average buy-in $1k. Strong ROI in similar fields. Full schedule and past results available on request.",
    status: ListingStatus.ACTIVE,
    datePosted: "2024-07-18T12:00:00Z",
    paymentMethodsAccepted: ["Crypto (USDT/BTC)"],
    stakingDetails: {
      gameType: "Online Series",
      eventVenueDetails: "GG Poker - Titans of Poker Series",
      totalBuyIn: 25000, // Total package buy-in
      markup: 1.15,
      percentageForSale: 60,
      minPurchasePercentage: 2,
      maxPurchasePercentage: 20,
    },
     isFeatured: false,
  },
  {
    id: "listing5-player1-paused",
    playerId: MOCK_PLAYER_USER_ID,
    title: "Paused Staking Package for Local Series",
    listingType: ListingType.STAKING,
    description: "This package is currently on hold. Will resume soon.",
    status: ListingStatus.PAUSED,
    datePosted: "2024-06-01T10:00:00Z",
    paymentMethodsAccepted: ["Cash"],
    stakingDetails: {
      gameType: "Tournament Series",
      eventVenueDetails: "Local Casino Fest",
      totalBuyIn: 1000,
      markup: 1.1,
      percentageForSale: 30,
      minPurchasePercentage: 5,
      maxPurchasePercentage: 10,
    },
    isFeatured: false,
  },
   {
    id: "listing6-player1-completed",
    playerId: MOCK_PLAYER_USER_ID,
    title: "Completed WSOP Circuit Event Staking",
    listingType: ListingType.STAKING,
    description: "This staking for the WSOP Circuit event has been completed. Thanks to all backers!",
    status: ListingStatus.COMPLETED,
    datePosted: "2024-05-01T10:00:00Z",
    paymentMethodsAccepted: ["PayPal"],
    stakingDetails: {
      gameType: "Tournament",
      eventVenueDetails: "WSOP Circuit - Online",
      totalBuyIn: 500,
      markup: 1.2,
      percentageForSale: 40,
      minPurchasePercentage: 2,
      maxPurchasePercentage: 10,
    },
    isFeatured: false,
  },
  {
    id: "listing7-player2-rejected",
    playerId: "player2",
    title: "Rejected: Unclear Staking Proposal",
    listingType: ListingType.STAKING,
    description: "Requesting stake for 'various online games', markup 1.5. No schedule.",
    status: ListingStatus.REJECTED,
    datePosted: "2024-07-22T11:00:00Z",
    paymentMethodsAccepted: ["Crypto"],
    stakingDetails: {
      gameType: "Online Cash",
      eventVenueDetails: "Various",
      totalBuyIn: 1000,
      markup: 1.5,
      percentageForSale: 20,
      minPurchasePercentage: 5,
      maxPurchasePercentage: 20,
    },
    isFeatured: false,
    rejectionReason: "Listing details are too vague. Please provide a specific schedule and game types."
  }
];

export let mockRatings: Rating[] = [
  {
    id: "rating1",
    raterId: MOCK_BACKER_USER_ID,
    rateeId: MOCK_PLAYER_USER_ID,
    listingId: "listing1",
    score: 5,
    comment: "Excellent communication and updates throughout the tournament. Very professional!",
    date: "2023-08-01T10:00:00Z",
    aspects: { professionalism: 5, transparency: 5, communication: 5 }
  },
  {
    id: "rating2",
    raterId: MOCK_PLAYER_USER_ID,
    rateeId: MOCK_BACKER_USER_ID, // Player rating a backer
    listingId: "listing1", // Assume this was related to a completed deal for listing1
    score: 5, // Overall score
    comment: "Payment was prompt. Great backer to work with.",
    date: "2023-08-02T11:00:00Z",
    aspects: { paymentSpeed: 5, communication: 5 } // Specific aspects for backer
  },
  {
    id: "rating3-player2-backer1",
    raterId: MOCK_BACKER_USER_ID, // backer1 rating player2
    rateeId: "player2",
    listingId: "listing2", // For PLO coaching
    score: 4,
    comment: "Very insightful PLO coaching, helped my game a lot!",
    date: "2024-07-25T14:00:00Z",
    aspects: { professionalism: 4, communication: 5 }
  }
];

export let mockMessages: Message[] = [
    { id: 'msg1', conversationId: 'conv1', senderId: MOCK_BACKER_USER_ID, receiverId: MOCK_PLAYER_USER_ID, content: 'Hi, interested in your WSOP Main Event package. Can you share more details on your past results in similar events?', timestamp: '2024-07-16T10:00:00Z', isRead: true },
    { id: 'msg2', conversationId: 'conv1', senderId: MOCK_PLAYER_USER_ID, receiverId: MOCK_BACKER_USER_ID, content: 'Sure! I can send over my Hendon Mob and a summary. What percentage are you considering?', timestamp: '2024-07-16T10:05:00Z', isRead: false },
    { id: 'msg3', conversationId: 'conv2', senderId: "player2", receiverId: MOCK_BACKER_USER_ID, content: 'Hey, I saw your profile. I offer PLO coaching if you are interested in improving that part of your game.', timestamp: '2024-07-17T11:00:00Z', isRead: true },
];

export let mockConversations: Conversation[] = [
    { id: 'conv1', participantIds: [MOCK_PLAYER_USER_ID, MOCK_BACKER_USER_ID], listingId: 'listing1', lastMessage: mockMessages.find(m=>m.id === 'msg2')! },
    { id: 'conv2', participantIds: ["player2", MOCK_BACKER_USER_ID], listingId: 'listing2', lastMessage: mockMessages.find(m=>m.id === 'msg3')! },
];

// Functions to update mock data
export const addListing = (listing: Listing) => {
  mockListings.unshift(listing);
};

export const updateListingStatus = (listingId: string, status: ListingStatus, rejectionReason?: string) => {
  mockListings = mockListings.map(l => {
    if (l.id === listingId) {
      const updatedListing = { ...l, status };
      if (status === ListingStatus.REJECTED && rejectionReason) {
        updatedListing.rejectionReason = rejectionReason;
      } else if (status !== ListingStatus.REJECTED) {
        // Clear rejection reason if status changes from REJECTED to something else
        delete updatedListing.rejectionReason;
      }
      return updatedListing;
    }
    return l;
  });
};

export const deleteListing = (listingId: string) => {
  mockListings = mockListings.filter(l => l.id !== listingId);
};

export const toggleFeatureListing = (listingId: string) => {
  mockListings = mockListings.map(l => l.id === listingId ? { ...l, isFeatured: !l.isFeatured } : l);
};

export const addRating = (rating: Rating) => {
  mockRatings.push(rating);
  // Update the ratee's (player or backer) average rating
  const ratee = mockUsers.find(u => u.id === rating.rateeId);
  if (ratee) {
    const relevantRatings = mockRatings.filter(r => r.rateeId === ratee.id);
    const totalScore = relevantRatings.reduce((sum, r) => sum + r.score, 0);
    ratee.starRating = parseFloat((totalScore / relevantRatings.length).toFixed(1));
    ratee.ratingsCount = relevantRatings.length;
  }
};

export const addMessageToConversation = (conversationId: string, message: Message, isNewConversation?: boolean) => {
    mockMessages.push(message);
    let convo = mockConversations.find(c => c.id === conversationId);
    if (convo) {
        convo.lastMessage = message;
    } else if (isNewConversation) {
        // This case should ideally be handled by creating the conversation first
        // For simplicity, MessagesPage.tsx handles adding new conversations to its local state
        // and mockConversations array. A more robust solution would centralize conversation creation here.
        console.warn(`Conversation ${conversationId} not found for new message, but was marked as new. Client should handle adding it to mockConversations.`);
    }
};