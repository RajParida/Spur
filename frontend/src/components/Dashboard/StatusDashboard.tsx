import React, { FC, useState } from 'react';
import { Button } from '@/components/Common/Button';
import { Status, StatusType, EnergyLevel, CreateStatusRequest } from '@/types';
import { statusService } from '@/services/statusService';
import clsx from 'clsx';

interface StatusDashboardProps {
  currentStatus: Status | null;
  onStatusCreated: (status: Status) => void;
  onStatusExpired: () => void;
  isLoading?: boolean;
}

/**
 * Main status dashboard with three toggle buttons
 * Handles status creation and display
 */
export const StatusDashboard: FC<StatusDashboardProps> = ({
  currentStatus,
  onStatusCreated,
  onStatusExpired,
  isLoading = false,
}) => {
  const [selectedType, setSelectedType] = useState<StatusType | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('high');
  const [selectedDuration, setSelectedDuration] = useState<60 | 180 | 720>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Handle status creation
  const handleCreateStatus = async () => {
    if (!selectedType) return;

    try {
      setIsSubmitting(true);
      const request: CreateStatusRequest = {
        type: selectedType,
        energyLevel: selectedEnergy,
        durationMinutes: selectedDuration,
      };

      const status = await statusService.createStatus(request);
      onStatusCreated(status);
      setShowOptions(false);
      setSelectedType(null);
    } catch (error) {
      console.error('Failed to create status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status expiration
  const handleExpireStatus = async () => {
    if (!currentStatus) return;

    try {
      await statusService.expireStatus(currentStatus.id);
      onStatusExpired();
      setSelectedType(null);
    } catch (error) {
      console.error('Failed to expire status:', error);
    }
  };

  // If user has active status, show it
  if (currentStatus?.isActive) {
    return (
      <div className="p-4 space-y-6">
        <ActiveStatusCard status={currentStatus} onExpire={handleExpireStatus} />
      </div>
    );
  }

  // Show status selection options
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-8">What's your vibe?</h1>

      {/* Status Type Buttons */}
      <div className="space-y-3">
        <StatusToggleOption
          label="Free Now"
          emoji="🚀"
          type="free_now"
          selected={selectedType === 'free_now'}
          onClick={() => setSelectedType('free_now')}
        />
        <StatusToggleOption
          label="Free Tonight"
          emoji="🌙"
          type="free_tonight"
          selected={selectedType === 'free_tonight'}
          onClick={() => setSelectedType('free_tonight')}
        />
        <StatusToggleOption
          label="Already Here"
          emoji="📍"
          type="already_here"
          selected={selectedType === 'already_here'}
          onClick={() => setSelectedType('already_here')}
        />
      </div>

      {/* Show options if status type selected */}
      {selectedType && (
        <>
          {/* Energy Level Selector */}
          <div className="mt-6 p-4 bg-bg-secondary rounded-lg">
            <p className="text-sm text-gray-400 mb-3">Energy Level</p>
            <div className="flex gap-3">
              <EnergyButton
                label="Chill"
                emoji="🔋"
                isSelected={selectedEnergy === 'low'}
                onClick={() => setSelectedEnergy('low')}
              />
              <EnergyButton
                label="Active"
                emoji="⚡"
                isSelected={selectedEnergy === 'high'}
                onClick={() => setSelectedEnergy('high')}
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div className="p-4 bg-bg-secondary rounded-lg">
            <p className="text-sm text-gray-400 mb-3">How Long?</p>
            <div className="flex gap-2">
              <DurationButton
                label="1hr"
                duration={60}
                isSelected={selectedDuration === 60}
                onClick={() => setSelectedDuration(60)}
              />
              <DurationButton
                label="3hrs"
                duration={180}
                isSelected={selectedDuration === 180}
                onClick={() => setSelectedDuration(180)}
              />
              <DurationButton
                label="12hrs"
                duration={720}
                isSelected={selectedDuration === 720}
                onClick={() => setSelectedDuration(720)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            onClick={handleCreateStatus}
            className="mt-6"
          >
            ✨ Go Live
          </Button>
        </>
      )}
    </div>
  );
};

/**
 * Status type toggle option
 */
interface StatusToggleOptionProps {
  label: string;
  emoji: string;
  type: StatusType;
  selected: boolean;
  onClick: () => void;
}

const StatusToggleOption: FC<StatusToggleOptionProps> = ({
  label,
  emoji,
  selected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full p-4 rounded-xl transition-all duration-200',
        'flex items-center gap-4',
        selected
          ? 'bg-neon-green text-bg-primary font-bold shadow-neon-glow'
          : 'bg-bg-secondary text-white border-2 border-transparent hover:border-neon-cyan'
      )}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-xl flex-1 text-left">{label}</span>
      {selected && <span className="text-2xl">✓</span>}
    </button>
  );
};

/**
 * Energy level button
 */
interface EnergyButtonProps {
  label: string;
  emoji: string;
  isSelected: boolean;
  onClick: () => void;
}

const EnergyButton: FC<EnergyButtonProps> = ({ label, emoji, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex-1 p-3 rounded-lg transition-all duration-200',
        'text-center font-semibold',
        isSelected
          ? 'bg-neon-cyan text-bg-primary'
          : 'bg-bg-tertiary text-white border border-bg-tertiary hover:border-neon-cyan'
      )}
    >
      {emoji} {label}
    </button>
  );
};

/**
 * Duration button
 */
interface DurationButtonProps {
  label: string;
  duration: number;
  isSelected: boolean;
  onClick: () => void;
}

const DurationButton: FC<DurationButtonProps> = ({ label, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex-1 p-2 text-sm rounded-lg transition-all duration-200',
        'font-semibold',
        isSelected
          ? 'bg-neon-yellow text-bg-primary'
          : 'bg-bg-tertiary text-white border border-bg-tertiary hover:border-neon-yellow'
      )}
    >
      {label}
    </button>
  );
};

/**
 * Card showing active status
 */
interface ActiveStatusCardProps {
  status: Status;
  onExpire: () => void;
}

const ActiveStatusCard: FC<ActiveStatusCardProps> = ({ status, onExpire }) => {
  const statusEmoji = {
    free_now: '🚀',
    free_tonight: '🌙',
    already_here: '📍',
  };

  const energyEmoji = {
    low: '🔋',
    high: '⚡',
  };

  const timeRemaining = calculateTimeRemaining(status.expiresAt);

  return (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border-2 border-neon-green shadow-neon-glow">
      <div className="text-center">
        <div className="text-5xl mb-2">{statusEmoji[status.type]}</div>
        <p className="text-gray-400 text-sm mb-4">You're currently live</p>
        <p className="text-2xl font-bold mb-1">
          {status.type.replace('_', ' ').toUpperCase()}
        </p>
        <p className="text-lg mb-4 flex items-center justify-center gap-2">
          <span>{energyEmoji[status.energyLevel]}</span>
          <span className="capitalize">{status.energyLevel}</span>
        </p>
        <p className="text-neon-cyan font-bold text-lg mb-6">
          Expires in {timeRemaining}
        </p>
        <Button
          variant="danger"
          fullWidth
          onClick={onExpire}
        >
          End Status
        </Button>
      </div>
    </div>
  );
};

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
