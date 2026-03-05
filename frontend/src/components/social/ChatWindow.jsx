import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const ChatWindow = ({ friend, onClose }) => {
  const { messages, loading, hasMore, sendMessage, loadMore, handleTyping, isTyping, currentUserId } = useChat(friend._id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    const content = newMessage;
    setNewMessage('');
    
    await sendMessage(content);
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !loading) {
      loadMore();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Today';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Today';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {friend.name?.[0]?.toUpperCase() || friend.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
            friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
          }`} />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="font-semibold truncate block">{friend.name || friend.email}</span>
          <span className="text-xs text-muted-foreground">
            {friend.isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              'Offline'
            )}
            {isTyping && <span className="text-indigo-600 ml-2">typing...</span>}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <svg className="w-6 h-6 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start a conversation with {friend.name || 'your friend'}!</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {loading ? 'Loading...' : 'Load more messages'}
              </button>
            )}
            
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground px-2">{date}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-2">
                  {msgs.map((message) => {
                    // Determine if message is from current user
                    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                    const isMe = senderId === currentUserId || message.sender === 'me';
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          } ${message.pending ? 'opacity-60' : ''}`}
                        >
                          <p className="break-words">{message.content}</p>
                          <div className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                            {formatTime(message.createdAt)}
                            {isMe && message.read && (
                              <span className="ml-1">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300"
            maxLength={2000}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-indigo-600 hover:bg-indigo-700 px-4"
          >
            {sending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
