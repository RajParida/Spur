import React, { FC } from 'react';
import { Status, User } from '@/types';
import clsx from 'clsx';

interface DoubleBlindfeedProps {
  feed: Status[];
  isLoading: boolean;
  canSeeFeed: boolean;
  onStatusClick?: (status: Status) => void;
}

/**
 * Double-blind feed - only visible if user has active status
 * Shows available friends
 */
export const DoubleBlindfeed: FC<DoubleBlindfeedProps> = ({
  feed,
  isLoading,
  canSeeFeed,
  onStatusClick,
}) => {
  // If user doesn't have active status, show blurred prompt
  if (!canSeeFeed) {
    return (
      <BlurredPrompt />
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-2xl font-bold mb-4">Who's Free 👀</h2>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && feed.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg">No friends around right now</p>
          <p className="text-sm">Check back in a bit!</p>
        </div>
      )}

      {!isLoading && feed.length > 0 && (
        <div className="space-y-3">
          {feed.map((status) => (
            <StatusFeedCard
              key={status.id}
              status={status}
              onClick={() => onStatusClick?.(status)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Blurred prompt when user doesn't have active status
 */
const BlurredPrompt: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl opacity-20">👀</div>
        <h2 className="text-2xl font-bold text-gray-400">Peek?</h2>
        <p className="text-gray-500">
          Toggle your status to see who's free around you
        </p>
        <div className="mt-6 pt-6 border-t border-bg-tertiary">
          <p className="text-sm text-gray-600">
            Only friends with active statuses can see the feed
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual status card in feed
 */
interface StatusFeedCardProps {
  status: Status;
  onClick?: () => void;
  friend?: User;
}

const StatusFeedCard: FC<StatusFeedCardProps> = ({ status, onClick, friend }) => {
  const statusEmoji = {
    free_now: '🚀',
    free_tonight: '🌙',
    already_here: '📍',
  };

  const energyEmoji = {
    low: '🔋',
    high: '⚡',
  };

  const statusColor = {
    free_now: 'from-neon-green/20 to-bg-secondary',
    free_tonight: 'from-neon-purple/20 to-bg-secondary',
    already_here: 'from-neon-cyan/20 to-bg-secondary',
  };

  const borderColor = {
    free_now: 'border-neon-green',
    free_tonight: 'border-neon-purple',
    already_here: 'border-neon-cyan',
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full p-4 rounded-xl transition-all duration-200',
        'bg-gradient-to-r',
        statusColor[status.type],
        'border-2',
        borderColor[status.type],
        'hover:shadow-lg active:scale-95',
        'text-left'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{statusEmoji[status.type]}</span>
            <span className="text-sm font-semibold capitalize">
              {status.type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <span>{energyEmoji[status.energyLevel]}</span>
            <span className="capitalize">{status.energyLevel} vibe</span>
          </div>
          {status.location && (
            <p className="text-xs text-gray-400">📍 {status.location}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-gray-400 font-mono">
            {getTimeRemaining(status.expiresAt)}
          </span>
          <span className="text-lg">→</span>
        </div>
      </div>
    </button>
  );
};

/**
 * Loading skeleton for feed card
 */
const FeedCardSkeleton: FC = () => {
  return (
    <div className="w-full p-4 rounded-xl bg-bg-secondary animate-pulse">
      <div className="h-4 bg-bg-tertiary rounded mb-2"></div>
      <div className="h-3 bg-bg-tertiary rounded w-2/3"></div>
    </div>
  );
};

function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return 'now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
