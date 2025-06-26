
import React, { useState, useContext, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Listing, ListingType, ListingStatus, StakingDetails, CoachingDetails, UserRole } from '../types';
import { addListing } from '../data/mockData';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { enhanceTextWithGemini } from '../services/geminiService'; // Gemini service

const CreateListingPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>(ListingType.STAKING);
  const [description, setDescription] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  
  // Staking specific
  const [gameType, setGameType] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [totalBuyIn, setTotalBuyIn] = useState<number | string>('');
  const [markup, setMarkup] = useState<number | string>(1.0);
  const [percentageForSale, setPercentageForSale] = useState<number | string>('');
  const [minPurchase, setMinPurchase] = useState<number | string>(1);
  const [maxPurchase, setMaxPurchase] = useState<number | string>(10);

  // Coaching specific
  const [serviceType, setServiceType] = useState('');
  const [price, setPrice] = useState<number | string>(''); // Can be per hour or per session
  const [priceType, setPriceType] = useState<'perHour' | 'perSession'>('perHour');
  const [sessionDuration, setSessionDuration] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!auth?.currentUser || auth.currentUser.role !== UserRole.PLAYER) {
    navigate('/'); // Redirect if not a player
    return null;
  }

  const handlePaymentMethodChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setPaymentMethods(prev => 
      checked ? [...prev, value] : prev.filter(pm => pm !== value)
    );
  };

  const handleEnhanceDescription = async () => {
    if (!description.trim()) {
      setAiError("Please write a base description first.");
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    try {
      const enhancedDesc = await enhanceTextWithGemini(description, listingType === ListingType.STAKING ? 'staking' : 'coaching');
      setDescription(enhancedDesc);
    } catch (e: any) {
      setAiError(e.message || "Failed to enhance description.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title || !description || paymentMethods.length === 0) {
        setError("Please fill in all required fields: Title, Description, and Payment Methods.");
        setIsLoading(false);
        return;
    }

    let stakingDetails: StakingDetails | undefined = undefined;
    let coachingDetails: CoachingDetails | undefined = undefined;

    if (listingType === ListingType.STAKING) {
      if (!gameType || !eventVenue || !totalBuyIn || !markup || !percentageForSale || !minPurchase || !maxPurchase) {
        setError("Please fill all staking-specific fields.");
        setIsLoading(false);
        return;
      }
      stakingDetails = {
        gameType, eventVenueDetails: eventVenue, 
        totalBuyIn: Number(totalBuyIn), markup: Number(markup),
        percentageForSale: Number(percentageForSale), 
        minPurchasePercentage: Number(minPurchase), maxPurchasePercentage: Number(maxPurchase)
      };
    } else if (listingType === ListingType.COACHING) {
      if (!serviceType || !price) {
        setError("Please fill all coaching-specific fields.");
        setIsLoading(false);
        return;
      }
      coachingDetails = {
        serviceType,
        pricePerHour: priceType === 'perHour' ? Number(price) : undefined,
        pricePerSession: priceType === 'perSession' ? Number(price) : undefined,
        sessionDuration: sessionDuration || undefined,
      };
    }
    
    const newListing: Listing = {
      id: `listing-${Date.now()}`,
      playerId: auth.currentUser.id,
      title,
      listingType,
      description,
      status: ListingStatus.PENDING_APPROVAL, // New listings need approval
      datePosted: new Date().toISOString(),
      paymentMethodsAccepted: paymentMethods,
      stakingDetails,
      coachingDetails,
      isFeatured: false,
    };

    // Simulate API call
    setTimeout(() => {
      addListing(newListing);
      setIsLoading(false);
      navigate(`/listing/${newListing.id}`);
    }, 1000);
  };

  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        
        <div>
          <label htmlFor="title" className={labelClass}>Listing Title <span className="text-red-500">*</span></label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClass} required />
        </div>

        <div>
          <label htmlFor="listingType" className={labelClass}>Listing Type <span className="text-red-500">*</span></label>
          <select id="listingType" value={listingType} onChange={(e) => setListingType(e.target.value as ListingType)} className={commonInputClass} required>
            {Object.values(ListingType).filter(lt => lt !== ListingType.OTHER).map(type => ( // Exclude 'Other' for now
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Description <span className="text-red-500">*</span></label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={commonInputClass} required />
          <div className="mt-2 flex items-center justify-end">
             {aiError && <p className="text-xs text-red-500 mr-2">{aiError}</p>}
            <Button type="button" onClick={handleEnhanceDescription} variant="secondary" size="sm" isLoading={isAiLoading} disabled={isAiLoading || !process.env.API_KEY}>
               {process.env.API_KEY ? '✨ Enhance with AI' : 'AI Disabled (No API Key)'}
            </Button>
          </div>
        </div>

        {/* Staking Fields */}
        {listingType === ListingType.STAKING && (
          <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700">Staking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gameType" className={labelClass}>Game Type <span className="text-red-500">*</span></label>
                <input type="text" id="gameType" value={gameType} onChange={(e) => setGameType(e.target.value)} placeholder="e.g., NLH Tournament, PLO Cash" className={commonInputClass} required/>
              </div>
              <div>
                <label htmlFor="eventVenue" className={labelClass}>Event/Venue Details <span className="text-red-500">*</span></label>
                <input type="text" id="eventVenue" value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} placeholder="e.g., WSOP Main Event, Online $55 MTT" className={commonInputClass} required/>
              </div>
              <div>
                <label htmlFor="totalBuyIn" className={labelClass}>Total Buy-In ($) <span className="text-red-500">*</span></label>
                <input type="number" id="totalBuyIn" value={totalBuyIn} onChange={(e) => setTotalBuyIn(Number(e.target.value))} min="0" step="any" className={commonInputClass} required/>
              </div>
              <div>
                <label htmlFor="markup" className={labelClass}>Markup (e.g., 1.0 to 1.5) <span className="text-red-500">*</span></label>
                <input type="number" id="markup" value={markup} onChange={(e) => setMarkup(Number(e.target.value))} min="1.0" step="0.01" className={commonInputClass} required/>
              </div>
              <div>
                <label htmlFor="percentageForSale" className={labelClass}>Percentage for Sale (%) <span className="text-red-500">*</span></label>
                <input type="number" id="percentageForSale" value={percentageForSale} onChange={(e) => setPercentageForSale(Number(e.target.value))} min="1" max="100" className={commonInputClass} required/>
              </div>
               <div className="col-span-1 md:col-span-2 text-sm text-gray-600">
                1% Cost: {Number(totalBuyIn) > 0 && Number(markup) > 0 ? `$${((Number(totalBuyIn) * Number(markup)) / 100).toFixed(2)}` : '$0.00'}
              </div>
              <div>
                <label htmlFor="minPurchase" className={labelClass}>Min Purchase (%) <span className="text-red-500">*</span></label>
                <input type="number" id="minPurchase" value={minPurchase} onChange={(e) => setMinPurchase(Number(e.target.value))} min="0.1" step="0.1" className={commonInputClass} required/>
              </div>
              <div>
                <label htmlFor="maxPurchase" className={labelClass}>Max Purchase (%) <span className="text-red-500">*</span></label>
                <input type="number" id="maxPurchase" value={maxPurchase} onChange={(e) => setMaxPurchase(Number(e.target.value))} min="1" step="1" className={commonInputClass} required/>
              </div>
            </div>
          </div>
        )}

        {/* Coaching Fields */}
        {listingType === ListingType.COACHING && (
          <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700">Coaching Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="serviceType" className={labelClass}>Service Type <span className="text-red-500">*</span></label>
                <input type="text" id="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="e.g., Hand History Review, Mental Game" className={commonInputClass} required/>
              </div>
              <div>
                <label htmlFor="priceType" className={labelClass}>Price Type <span className="text-red-500">*</span></label>
                <select id="priceType" value={priceType} onChange={(e) => setPriceType(e.target.value as 'perHour' | 'perSession')} className={commonInputClass}>
                  <option value="perHour">Per Hour</option>
                  <option value="perSession">Per Session</option>
                </select>
              </div>
              <div>
                <label htmlFor="price" className={labelClass}>Price ($) <span className="text-red-500">*</span></label>
                <input type="number" id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} min="0" step="any" className={commonInputClass} required/>
              </div>
              <div>
                <label htmlFor="sessionDuration" className={labelClass}>Session Duration (optional)</label>
                <input type="text" id="sessionDuration" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} placeholder="e.g., 60 minutes, 2 hours" className={commonInputClass}/>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label className={labelClass}>Payment Methods Accepted <span className="text-red-500">*</span></label>
          <div className="mt-2 space-y-2">
            {['PayPal', 'Crypto (BTC/ETH)', 'Bank Transfer', 'Skrill', 'Venmo', 'Zelle'].map(method => (
              <label key={method} className="flex items-center">
                <input
                  type="checkbox"
                  value={method}
                  checked={paymentMethods.includes(method)}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  aria-labelledby={`payment-method-${method}`}
                />
                <span id={`payment-method-${method}`} className="ml-2 text-sm text-gray-700">{method}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-5">
          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading} disabled={isLoading || isAiLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateListingPage;
