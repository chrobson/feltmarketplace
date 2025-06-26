import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { mockConversations, mockMessages, mockUsers, addMessageToConversation } from '../data/mockData';
import { Conversation, Message as MessageType, UserProfile } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const MessagesPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth?.currentUser) {
      setIsLoading(true);
      setTimeout(() => { // Simulate API call
        const userConvos = mockConversations.filter(c => c.participantIds.includes(auth.currentUser!.id));
        setConversations(userConvos);
        
        // Check for query params to auto-select conversation
        const listingIdParam = searchParams.get('listingId');
        const recipientIdParam = searchParams.get('recipientId');

        if (recipientIdParam) {
            let convoToSelect = userConvos.find(c => 
                c.participantIds.includes(recipientIdParam) && 
                (!listingIdParam || c.listingId === listingIdParam)
            );

            // If no existing convo, create a placeholder for a new one (not saved until message sent)
            if (!convoToSelect && auth.currentUser && recipientIdParam) {
                 const recipientUser = mockUsers.find(u => u.id === recipientIdParam);
                 if (recipientUser) {
                    convoToSelect = {
                        id: `temp-conv-${Date.now()}`,
                        participantIds: [auth.currentUser.id, recipientIdParam],
                        listingId: listingIdParam || undefined,
                        lastMessage: { // Placeholder
                            id: 'temp-msg',
                            conversationId: `temp-conv-${Date.now()}`,
                            senderId: '',
                            receiverId: '',
                            content: 'Start a new conversation...',
                            timestamp: new Date().toISOString(),
                            isRead: true,
                        }
                    };
                    // Do not add to main conversations list yet, only for selection
                 }
            }
            if (convoToSelect) {
                 handleSelectConversation(convoToSelect);
            }
        } else if (userConvos.length > 0) {
          handleSelectConversation(userConvos[0]); // Select first by default
        }
        setIsLoading(false);
      }, 300);
    }
  }, [auth?.currentUser, searchParams]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (!conversation.id.startsWith('temp-conv-')) { // Don't load messages for temp convos
        setIsLoading(true);
        setTimeout(() => { // Simulate API call
            const convoMessages = mockMessages.filter(m => m.conversationId === conversation.id).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            setMessages(convoMessages);
            setIsLoading(false);
        }, 200);
    } else {
        setMessages([]); // Clear messages for temp new convo
    }
  };

  const handleSendMessage = () => {
    if (!newMessageContent.trim() || !auth?.currentUser || !selectedConversation) return;

    const receiverId = selectedConversation.participantIds.find(id => id !== auth.currentUser!.id);
    if (!receiverId) return;

    let currentConvoId = selectedConversation.id;
    let isNewConversation = false;

    if (selectedConversation.id.startsWith('temp-conv-')) {
        // This is a new conversation, need to "create" it first
        const existingConvo = conversations.find(c => 
            c.participantIds.includes(auth.currentUser!.id) &&
            c.participantIds.includes(receiverId) &&
            c.listingId === selectedConversation.listingId
        );
        if (existingConvo) {
            currentConvoId = existingConvo.id;
            setSelectedConversation(existingConvo); // Switch to existing
        } else {
            isNewConversation = true;
            currentConvoId = `conv-${Date.now()}`; // Generate a "real" ID
            const newActualConversation: Conversation = {
                ...selectedConversation,
                id: currentConvoId,
                 lastMessage: { // This will be updated by addMessageToConversation
                    id: '', conversationId: currentConvoId, senderId: auth.currentUser.id,
                    receiverId: receiverId, content: newMessageContent, 
                    timestamp: new Date().toISOString(), isRead: false
                }
            };
            // Add to mockConversations (simulating backend save)
            mockConversations.unshift(newActualConversation);
            setConversations(prev => [newActualConversation, ...prev.filter(c => c.id !== selectedConversation.id)]);
            setSelectedConversation(newActualConversation);
        }
    }


    const newMessage: MessageType = {
      id: `msg-${Date.now()}`,
      conversationId: currentConvoId,
      senderId: auth.currentUser.id,
      receiverId: receiverId,
      content: newMessageContent,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    addMessageToConversation(currentConvoId, newMessage, isNewConversation); // Update mockData
    setMessages(prev => [...prev, newMessage]);
    setNewMessageContent('');

    // Update last message in conversations list
    setConversations(prevConvos => prevConvos.map(c => 
        c.id === currentConvoId ? { ...c, lastMessage: newMessage } : c
    ));
  };
  
  const getOtherParticipant = (conversation: Conversation): UserProfile | undefined => {
      const otherId = conversation.participantIds.find(id => id !== auth?.currentUser?.id);
      return mockUsers.find(u => u.id === otherId);
  };


  if (!auth?.currentUser) {
    return <div className="text-center py-10"><p>Please login to view your messages.</p><Link to="/"><Button variant="primary" className="mt-4">Go to Homepage</Button></Link></div>;
  }
  
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-150px)] bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
        </div>
        {conversations.length === 0 && !isLoading && (
            <p className="p-4 text-gray-500">No conversations yet.</p>
        )}
        {isLoading && conversations.length === 0 && <div className="p-4"><LoadingSpinner text="Loading chats..." size="sm"/></div>}
        {conversations.map(convo => {
          const otherUser = getOtherParticipant(convo);
          return (
            <div
              key={convo.id}
              className={`p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${selectedConversation?.id === convo.id ? 'bg-blue-50' : ''}`}
              onClick={() => handleSelectConversation(convo)}
            >
              <div className="flex items-center">
                <img src={otherUser?.profilePictureUrl || 'https://picsum.photos/seed/default/50'} alt={otherUser?.username} className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-700">{otherUser?.username || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-500 truncate w-48">{convo.lastMessage.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Messages View */}
      <div className="w-full md:w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <img src={getOtherParticipant(selectedConversation)?.profilePictureUrl || 'https://picsum.photos/seed/default/50'} alt={getOtherParticipant(selectedConversation)?.username} className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{getOtherParticipant(selectedConversation)?.username}</h2>
                    {selectedConversation.listingId && (
                        <Link to={`/listing/${selectedConversation.listingId}`} className="text-xs text-blue-500 hover:underline">
                            Related Listing
                        </Link>
                    )}
                </div>
              </div>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-100">
              {isLoading && messages.length === 0 && <LoadingSpinner text="Loading messages..." size="sm"/>}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === auth.currentUser!.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.senderId === auth.currentUser!.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === auth.currentUser!.id ? 'text-blue-200' : 'text-gray-400'} text-right`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
               {selectedConversation.id.startsWith('temp-conv-') && messages.length === 0 && (
                <p className="text-center text-gray-500">Start typing to send your first message to {getOtherParticipant(selectedConversation)?.username}.</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleSendMessage} variant="primary" disabled={!newMessageContent.trim()}>Send</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            <p>Select a conversation to view messages or start a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper in mockData to update conversations
const addMessageToData = (conversationId: string, message: MessageType, isNewConversation?: boolean) => {
    mockMessages.push(message);
    let convo = mockConversations.find(c => c.id === conversationId);
    if (convo) {
        convo.lastMessage = message;
    } else if (isNewConversation) {
        // This case is handled by direct addition in MessagesPage, but could be centralized
    }
};
// Add this function to mockData.ts if not already there, or integrate logic
if (typeof (window as any).addMessageToData === 'undefined') {
    (window as any).addMessageToData = addMessageToData;
}


export default MessagesPage;
