'use client';

import { useEffect, useState } from 'react';
import { useStatus, useStatusFeed } from '@/hooks/useStatus';
import { StatusDashboard } from '@/components/Dashboard/StatusDashboard';
import { DoubleBlindfeed } from '@/components/Feed/DoubleBlindfeed';
import { AppShell } from '@/components/Layout/MobileContainer';
import { Status } from '@/types';

/**
 * Home page - Main dashboard
 */
export default function HomePage() {
  const { status, hasActiveStatus, refetch } = useStatus();
  const { feed, isLoading, canSeeFeed } = useStatusFeed();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleStatusCreated = (newStatus: Status) => {
    setToastMessage(`Status posted! Expires in ${formatTime(newStatus.expiresAt)}`);
    refetch();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusExpired = () => {
    setToastMessage('Status ended');
    refetch();
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <AppShell>
      <div className="overflow-y-auto flex-1">
        {/* Header */}
        <div className="sticky top-0 bg-bg-secondary border-b border-bg-tertiary p-4 z-10">
          <h1 className="text-2xl font-bold">Spur</h1>
          <p className="text-sm text-gray-400">Frictionless scheduling</p>
        </div>

        {/* Status Dashboard */}
        <StatusDashboard
          currentStatus={status}
          onStatusCreated={handleStatusCreated}
          onStatusExpired={handleStatusExpired}
        />

        {/* Divider */}
        {hasActiveStatus && (
          <div className="mx-4 my-6 border-t border-bg-tertiary"></div>
        )}

        {/* Feed Section */}
        {hasActiveStatus && (
          <DoubleBlindfeed
            feed={feed}
            isLoading={isLoading}
            canSeeFeed={canSeeFeed}
          />
        )}
      </div>

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-24 left-4 right-4 bg-neon-green text-bg-primary p-3 rounded-lg text-center font-bold animate-pulse">
          {toastMessage}
        </div>
      )}
    </AppShell>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
