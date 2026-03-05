import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const useFriends = () => {
  const { accessToken: token } = useAuth();
  const { onlineFriends } = useSocket() || {};
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to get fresh headers with current token
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/friends`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        // Backend returns array directly, each item has { user: {...}, friendshipId, ... }
        const friendsList = Array.isArray(data) ? data.map(f => ({
          _id: f.user._id,
          name: f.user.name,
          email: f.user.email,
          beyondlyId: f.user.beyondlyId,
          avatar: f.user.avatar,
          isOnline: f.user.isOnline,
          lastSeen: f.user.lastSeen,
          friendshipId: f.friendshipId,
          location: f.location
        })) : [];
        setFriends(friendsList);
      } else {
        setError(data.message || data.error);
      }
    } catch (err) {
      setError('Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  }, [token, getHeaders]);

  // Fetch pending friend requests
  const fetchPendingRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/friends/requests`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        // Backend returns array directly
        setPendingRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  }, [token, getHeaders]);

  // Fetch sent requests
  const fetchSentRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/friends/requests/sent`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        // Backend returns array directly
        setSentRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch sent requests:', err);
    }
  }, [token, getHeaders]);

  // Add friend by Beyondly ID
  const addFriend = useCallback(async (beyondlyId) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/friends/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ beyondlyId })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchSentRequests();
        return { success: true, message: 'Friend request sent!' };
      } else {
        return { success: false, message: data.message || data.error };
      }
    } catch (err) {
      return { success: false, message: 'Failed to send request' };
    } finally {
      setLoading(false);
    }
  }, [token, getHeaders, fetchSentRequests]);

  // Accept friend request
  const acceptRequest = useCallback(async (requestId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/friends/accept/${requestId}`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        await Promise.all([fetchFriends(), fetchPendingRequests()]);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to accept request' };
    }
  }, [token, getHeaders, fetchFriends, fetchPendingRequests]);

  // Reject friend request
  const rejectRequest = useCallback(async (requestId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/friends/reject/${requestId}`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchPendingRequests();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [token, getHeaders, fetchPendingRequests]);

  // Remove friend
  const removeFriend = useCallback(async (friendshipId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchFriends();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [token, getHeaders, fetchFriends]);

  // Get friends with online status
  // Socket data takes priority, but fall back to API data if socket hasn't received status yet
  const getFriendsWithStatus = useCallback(() => {
    return friends.map(friend => {
      const socketStatus = onlineFriends?.[friend._id];
      return {
        ...friend,
        // Use socket status if available, otherwise keep API status
        isOnline: socketStatus !== undefined ? socketStatus.isOnline : friend.isOnline,
        lastSeen: socketStatus?.lastSeen || friend.lastSeen
      };
    });
  }, [friends, onlineFriends]);

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchFriends();
      fetchPendingRequests();
      fetchSentRequests();
    }
  }, [token]);

  // Listen for real-time friend request events
  useEffect(() => {
    const handleFriendRequest = (event) => {
      // Add the new request to pending requests directly for instant UI update
      setPendingRequests(prev => {
        const exists = prev.some(r => r._id === event.detail._id);
        if (exists) return prev;
        return [...prev, event.detail];
      });
    };

    window.addEventListener('friend:request:received', handleFriendRequest);
    return () => {
      window.removeEventListener('friend:request:received', handleFriendRequest);
    };
  }, []);

  return {
    friends: getFriendsWithStatus(),
    pendingRequests,
    sentRequests,
    loading,
    error,
    fetchFriends,
    fetchPendingRequests,
    addFriend,
    acceptRequest,
    rejectRequest,
    removeFriend
  };
};
