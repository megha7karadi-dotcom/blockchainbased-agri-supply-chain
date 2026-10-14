import React from 'react';

interface SmsNotificationData {
  phone: string;
  code: string;
  sender?: string;
  timestamp?: string;
  purpose?: 'login' | 'signup';
}

interface Props {
  sms: SmsNotificationData | null;
  onClose: () => void;
  onAutoFill?: (code: string) => void;
}

export const RealtimeSmsNotification: React.FC<Props> = () => {
  return null;
};
