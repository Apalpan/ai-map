import React from 'react';
import { FAVICON_URL } from '@/lib/brand';

const LOGO_SRC = FAVICON_URL;

export const OpenFlowLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <img
            src={LOGO_SRC}
            alt=""
            aria-hidden="true"
            className={`object-contain ${className}`.trim()}
        />
    );
};
