import { useState } from 'react';
import { useFriends } from '../../hooks/useFriends';
import { useSocket } from '../../context/SocketContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export const FriendsList = ({ onSelectFriend, onAddFriend }) => {
  const { friends, pendingRequests, loading, acceptRequest, rejectRequest, removeFriend } = useFriends();
  const { unreadMessages, friendLocations } = useSocket() || {};
  const [activeTab, setActiveTab] = useState('friends');
  const [processingId, setProcessingId] = useState(null);

  const handleAccept = async (requestId) => {
    setProcessingId(requestId);
    await acceptRequest(requestId);
    setProcessingId(null);
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    await rejectRequest(requestId);
    setProcessingId(null);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Unknown';
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Friends
          </CardTitle>
          {onAddFriend && (
            <Button
              onClick={onAddFriend}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </Button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mt-3 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'friends' 
                ? 'bg-background shadow text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors relative ${
              activeTab === 'requests' 
                ? 'bg-background shadow text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="w-6 h-6 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : activeTab === 'friends' ? (
          friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>No friends yet</p>
              <p className="text-sm mt-1">Add friends using their Beyondly ID</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  onClick={() => onSelectFriend?.(friend)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {friend.name?.[0]?.toUpperCase() || friend.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Online indicator */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                      friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{friend.name || friend.email}</span>
                      {unreadMessages?.[friend._id] > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          {unreadMessages[friend._id]}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {friend.isOnline ? (
                        <span className="text-green-400">Online</span>
                      ) : (
                        <span>Last seen {formatLastSeen(friend.lastSeen)}</span>
                      )}
                      {friendLocations?.[friend._id] && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {friendLocations[friend._id].city}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <svg className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Requests tab */
          pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {request.from?.name?.[0]?.toUpperCase() || request.from?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">{request.from?.name || request.from?.email}</span>
                    <span className="text-xs text-muted-foreground font-mono">{request.from?.beyondlyId}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(request._id)}
                      disabled={processingId === request._id}
                      className="h-8 px-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(request._id)}
                      disabled={processingId === request._id}
                      className="h-8 px-2 bg-green-600 hover:bg-green-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default FriendsList;
