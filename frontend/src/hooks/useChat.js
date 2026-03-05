import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const useChat = (friendId) => {
  const { accessToken: token } = useAuth();
  const { socket, sendMessage: socketSendMessage, markAsTyping, markAsRead, typingUsers, clearUnread } = useSocket() || {};
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const typingTimeoutRef = useRef(null);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch chat history
  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!token || !friendId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat/${friendId}?page=${pageNum}&limit=50`, { headers });
      const data = await res.json();
      if (res.ok) {
        const newMessages = data.messages || [];
        setMessages(prev => append ? [...newMessages.reverse(), ...prev] : newMessages.reverse());
        setHasMore(newMessages.length === 50);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [token, friendId]);

  // Load more (older messages)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMessages(page + 1, true);
    }
  }, [loading, hasMore, page, fetchMessages]);

  // Send message
  const sendMessage = useCallback(async (content) => {
    if (!token || !friendId || !content.trim()) return { success: false };
    
    // Optimistically add message
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content,
      sender: 'me',
      createdAt: new Date().toISOString(),
      pending: true
    };
    setMessages(prev => [...prev, tempMessage]);

    // Send via socket for real-time
    if (socket && socketSendMessage) {
      socketSendMessage(friendId, content);
    }

    // Also send via REST API for persistence
    try {
      const res = await fetch(`${API_URL}/chat/${friendId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (res.ok) {
        // Replace temp message with real one
        setMessages(prev => prev.map(m => 
          m._id === tempMessage._id ? { ...data.message, sender: 'me' } : m
        ));
        return { success: true };
      }
      // Remove temp message on failure
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
      return { success: false };
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
      return { success: false };
    }
  }, [token, friendId, socket, socketSendMessage]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (markAsTyping) {
      markAsTyping(friendId, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        markAsTyping(friendId, false);
      }, 2000);
    }
  }, [friendId, markAsTyping]);

  // Mark messages as read
  const handleMarkAsRead = useCallback(() => {
    if (markAsRead && clearUnread) {
      markAsRead(friendId);
      clearUnread(friendId);
    }
  }, [friendId, markAsRead, clearUnread]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket || !friendId) return;

    const handleReceive = (message) => {
      if (message.sender === friendId) {
        setMessages(prev => [...prev, { ...message, sender: friendId }]);
        // Auto-mark as read if chat is open
        handleMarkAsRead();
      }
    };

    socket.on('chat:receive', handleReceive);

    return () => {
      socket.off('chat:receive', handleReceive);
      // Clean up typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, friendId, handleMarkAsRead]);

  // Initial fetch
  useEffect(() => {
    if (friendId) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages(1);
      handleMarkAsRead();
    }
  }, [friendId]);

  return {
    messages,
    loading,
    hasMore,
    sendMessage,
    loadMore,
    handleTyping,
    handleMarkAsRead,
    isTyping: typingUsers?.[friendId] || false
  };
};
