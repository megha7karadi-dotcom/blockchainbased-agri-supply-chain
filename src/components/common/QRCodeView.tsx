import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  value: string;
  size?: number;
  className?: string;
  includeMargin?: boolean;
}

export const QRCodeView: React.FC<Props> = ({ 
  value, 
  size = 128, 
  className = '',
  includeMargin = false 
}) => {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      className={className}
      includeMargin={includeMargin}
    />
  );
};

