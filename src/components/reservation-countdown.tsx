'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, AlertTriangle } from 'lucide-react';

interface ReservationCountdownProps {
  lockedUntil: string | null;
  onExpired?: () => void;
}

export function ReservationCountdown({ lockedUntil, onExpired }: ReservationCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
    expired: boolean;
    isWarning: boolean;
  }>({
    minutes: 0,
    seconds: 0,
    expired: false,
    isWarning: false,
  });

  useEffect(() => {
    if (!lockedUntil) return;

    const timer = setInterval(() => {
      const now = new Date();
      const expireTime = new Date(lockedUntil);
      const diff = expireTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({
          minutes: 0,
          seconds: 0,
          expired: true,
          isWarning: false,
        });
        onExpired?.();
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        setTimeRemaining({
          minutes,
          seconds,
          expired: false,
          isWarning: minutes <= 2, // Warning when 2 minutes or less
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedUntil, onExpired]);

  if (!lockedUntil) return null;

  if (timeRemaining.expired) {
    return (
      <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-red-900">Reservation Expired</div>
          <p className="text-sm text-red-800 mt-1">
            Your reservation has expired. Returning you to the facility selection page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 p-4 rounded-lg flex items-start gap-3 transition-colors ${
        timeRemaining.isWarning
          ? 'bg-orange-50 border-orange-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      {timeRemaining.isWarning ? (
        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
      ) : (
        <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <div className={`font-semibold ${timeRemaining.isWarning ? 'text-orange-900' : 'text-blue-900'}`}>
          Reservation Expires In:
        </div>
        <div className={`text-2xl font-bold mt-1 font-mono ${timeRemaining.isWarning ? 'text-orange-700' : 'text-blue-700'}`}>
          {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
        </div>
        <p className={`text-sm mt-2 ${timeRemaining.isWarning ? 'text-orange-800' : 'text-blue-800'}`}>
          {timeRemaining.isWarning
            ? 'Please complete your booking soon before the reservation expires.'
            : 'Complete your booking before this time expires.'}
        </p>
      </div>
    </div>
  );
}
