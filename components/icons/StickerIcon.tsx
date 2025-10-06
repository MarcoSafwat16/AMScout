
import React from 'react';

const StickerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.5 9.5a.5.5 0 01.5-.5h.01a.5.5 0 01.5.5v.01a.5.5 0 01-.5.5h-.01a.5.5 0 01-.5-.5v-.01zM14.5 9.5a.5.5 0 01.5-.5h.01a.5.5 0 01.5.5v.01a.5.5 0 01-.5.5h-.01a.5.5 0 01-.5-.5v-.01z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.03v-.06a2 2 0 012-2h14a2 2 0 012 2v.06M21 13.97v.06a2 2 0 01-2 2H5a2 2 0 01-2-2v-.06" />
    </svg>
);

export default StickerIcon;
