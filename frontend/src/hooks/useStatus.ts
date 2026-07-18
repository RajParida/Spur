import { useCallback, useEffect, useState } from 'react';
import { Status } from '@/types';
import { statusService } from '@/services/statusService';
import { supabase } from '@/services/supabaseClient';

/**
 * Hook to manage user's current status
 */
export function useStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current active status
  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const activeStatus = await statusService.getActiveStatus();
      setStatus(activeStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('status-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuses',
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setStatus(null);
          } else {
            setStatus(payload.new as Status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
    hasActiveStatus: status?.isActive ?? false,
    timeRemaining: status ? calculateTimeRemaining(status.expiresAt) : null,
  };
}

/**
 * Hook to manage status feed (double-blind)
 */
export function useStatusFeed() {
  const [feed, setFeed] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userStatus = useStatus();

  const fetchFeed = useCallback(async () => {
    if (!userStatus.hasActiveStatus) {
      setFeed([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const statuses = await statusService.getFeed();
      setFeed(statuses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
    } finally {
      setIsLoading(false);
    }
  }, [userStatus.hasActiveStatus]);

  // Fetch when user's status changes
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userStatus.hasActiveStatus) return;

    const channel = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuses',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFeed((prev) => [payload.new as Status, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setFeed((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as Status) : s))
            );
          } else if (payload.eventType === 'DELETE') {
            setFeed((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userStatus.hasActiveStatus]);

  return {
    feed,
    isLoading,
    error,
    refetch: fetchFeed,
    canSeeFeed: userStatus.hasActiveStatus,
  };
}

/**
 * Helper to calculate time remaining
 */
function calculateTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return '0m';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
