import { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

export const BeyondlyIdCard = () => {
  const { beyondlyId, loading, copyBeyondlyId, fetchBeyondlyId } = useProfile();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBeyondlyId();
  }, [fetchBeyondlyId]);

  const handleCopy = async () => {
    const success = await copyBeyondlyId();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-slate-800/80 border-indigo-500/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          My Beyondly ID
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-400 mb-3">
          Share this ID with friends so they can connect with you
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-900/80 rounded-lg px-4 py-3 font-mono text-lg font-semibold tracking-wider text-center border border-slate-700">
            {loading ? (
              <span className="text-slate-500 animate-pulse">Loading...</span>
            ) : beyondlyId ? (
              <span className="text-indigo-400 font-bold">
                {beyondlyId}
              </span>
            ) : (
              <span className="text-slate-500">-</span>
            )}
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0 border-indigo-500/50 hover:bg-indigo-500/20 hover:border-indigo-400 text-white"
            disabled={!beyondlyId || loading}
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </Button>
        </div>
        {copied && (
          <p className="text-sm text-green-400 mt-2 text-center">
            Copied to clipboard!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BeyondlyIdCard;
