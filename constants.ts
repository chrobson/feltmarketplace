
import { UserProfile, UserRole } from './types';

export const APP_NAME = "Felt Marketplace";

export const MOCK_PLAYER_USER_ID = "player1";
export const MOCK_BACKER_USER_ID = "backer1";
export const MOCK_ADMIN_USER_ID = "admin1";

export const MOCK_PLAYER_PROFILE: UserProfile = {
  id: MOCK_PLAYER_USER_ID,
  username: "PokerPro123",
  profilePictureUrl: "https://picsum.photos/seed/pokerpro/200",
  bio: "Experienced NLH tournament player with multiple cashes in major events. Looking for backers for upcoming series. Also offering coaching for mid-stakes players.",
  starRating: 4.8,
  ratingsCount: 25,
  verificationLinks: {
    hendonMob: "https://pokerdb.thehendonmob.com/player.php?a=r&n=12345",
    twitter: "https://twitter.com/pokerpro123",
  },
  preferredGames: ["NLH Tournaments", "MTT Series"],
  role: UserRole.PLAYER,
};

export const MOCK_BACKER_PROFILE: UserProfile = {
  id: MOCK_BACKER_USER_ID,
  username: "StakeKing",
  profilePictureUrl: "https://picsum.photos/seed/stakeking/200",
  bio: "Active backer looking for talented players with solid results and good markup.",
  starRating: 4.5,
  ratingsCount: 10,
  preferredGames: ["NLH Tournaments"],
  role: UserRole.BACKER,
};

export const MOCK_ADMIN_PROFILE: UserProfile = {
  id: MOCK_ADMIN_USER_ID,
  username: "MarketplaceAdmin",
  profilePictureUrl: "https://picsum.photos/seed/admin/200",
  bio: "Felt Marketplace Administrator.",
  starRating: 5.0,
  ratingsCount: 0,
  preferredGames: [],
  role: UserRole.ADMIN,
};

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
// process.env.API_KEY will be used directly in geminiService.ts
// Ensure it's set in your environment. For this example, if it's not set,
// the AI feature will show an error.
// export const GEMINI_API_KEY = process.env.API_KEY; // This is illustrative; do not hardcode.
