import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const useProfile = () => {
  const { accessToken: token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [beyondlyId, setBeyondlyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/me`, { headers });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setBeyondlyId(data.user.beyondlyId);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch just the Beyondly ID
  const fetchBeyondlyId = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/my-id`, { headers });
      const data = await res.json();
      if (res.ok) {
        setBeyondlyId(data.beyondlyId);
        return data.beyondlyId;
      }
    } catch (err) {
      console.error('Failed to fetch Beyondly ID:', err);
    }
    return null;
  }, [token]);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    if (!token) return { success: false };
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Update location
  const updateLocation = useCallback(async (locationData) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/user/location`, {
        method: 'POST',
        headers,
        body: JSON.stringify(locationData)
      });
      const data = await res.json();
      return { success: res.ok, location: data.location };
    } catch (err) {
      return { success: false };
    }
  }, [token]);

  // Get current location
  const fetchLocation = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/user/location`, { headers });
      const data = await res.json();
      if (res.ok) {
        return data.location;
      }
    } catch (err) {
      console.error('Failed to fetch location:', err);
    }
    return null;
  }, [token]);

  // Copy Beyondly ID to clipboard
  const copyBeyondlyId = useCallback(async () => {
    if (beyondlyId) {
      try {
        await navigator.clipboard.writeText(beyondlyId);
        return true;
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    return false;
  }, [beyondlyId]);

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  return {
    profile,
    beyondlyId,
    loading,
    error,
    fetchProfile,
    fetchBeyondlyId,
    updateProfile,
    updateLocation,
    fetchLocation,
    copyBeyondlyId
  };
};
