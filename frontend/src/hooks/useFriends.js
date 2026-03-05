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

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/friends`, { headers });
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch pending friend requests
  const fetchPendingRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/friends/requests`, { headers });
      const data = await res.json();
      if (res.ok) {
        setPendingRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  }, [token]);

  // Fetch sent requests
  const fetchSentRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/friends/requests/sent`, { headers });
      const data = await res.json();
      if (res.ok) {
        setSentRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch sent requests:', err);
    }
  }, [token]);

  // Add friend by Beyondly ID
  const addFriend = useCallback(async (beyondlyId) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/friends/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ beyondlyId })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchSentRequests();
        return { success: true, message: 'Friend request sent!' };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to send request' };
    } finally {
      setLoading(false);
    }
  }, [token, fetchSentRequests]);

  // Accept friend request
  const acceptRequest = useCallback(async (requestId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/friends/accept/${requestId}`, {
        method: 'PATCH',
        headers
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
  }, [token, fetchFriends, fetchPendingRequests]);

  // Reject friend request
  const rejectRequest = useCallback(async (requestId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/friends/reject/${requestId}`, {
        method: 'PATCH',
        headers
      });
      if (res.ok) {
        await fetchPendingRequests();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [token, fetchPendingRequests]);

  // Remove friend
  const removeFriend = useCallback(async (friendshipId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/friends/${friendshipId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        await fetchFriends();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [token, fetchFriends]);

  // Get friends with online status
  const getFriendsWithStatus = useCallback(() => {
    return friends.map(friend => ({
      ...friend,
      isOnline: onlineFriends?.[friend._id]?.isOnline || false,
      lastSeen: onlineFriends?.[friend._id]?.lastSeen || friend.lastSeen
    }));
  }, [friends, onlineFriends]);

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchFriends();
      fetchPendingRequests();
      fetchSentRequests();
    }
  }, [token]);

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
