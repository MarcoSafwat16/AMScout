import React from 'react';

const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9A2.25 2.25 0 0018.75 19.5v-9a2.25 2.25 0 00-2.25-2.25H15M12 15V4.5m0 0l-3.75 3.75M12 4.5l3.75 3.75" />
    </svg>
);
export default ShareIcon;
