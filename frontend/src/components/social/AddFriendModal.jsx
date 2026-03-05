import { useState } from 'react';
import { useFriends } from '../../hooks/useFriends';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const AddFriendModal = ({ isOpen, onClose }) => {
  const { addFriend, loading } = useFriends();
  const [beyondlyId, setBeyondlyId] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!beyondlyId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Beyondly ID' });
      return;
    }

    const result = await addFriend(beyondlyId.trim().toUpperCase());
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Friend request sent!' });
      setBeyondlyId('');
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to send request' });
    }
  };

  const handleClose = () => {
    setBeyondlyId('');
    setMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Friend
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter your friend's Beyondly ID
            </label>
            <Input
              type="text"
              value={beyondlyId}
              onChange={(e) => setBeyondlyId(e.target.value.toUpperCase())}
              placeholder="BYD-XXXXX"
              className="font-mono text-center tracking-wider text-lg"
              maxLength={10}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Example: BYD-4X92K
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !beyondlyId.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;
