import React from 'react';

const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.99 2.007c.552 0 1 .448 1 1v2.585l2.293-2.292a1 1 0 011.414 1.414L14.414 7H16a1 1 0 011 1v1.585l2.293-2.292a1 1 0 011.414 1.414l-2.292 2.293L21 12v3a1 1 0 01-1 1h-2.586l2.293 2.293a1 1 0 11-1.414 1.414L18 17.414V19a1 1 0 11-2 0v-1.586l-2.293 2.293a1 1 0 01-1.414-1.414L14.586 16H9.414l-2.293 2.293a1 1 0 01-1.414-1.414L8 17.414V19a1 1 0 11-2 0v-1.586l-2.293 2.293a1 1 0 01-1.414-1.414L4.586 16H3a1 1 0 01-1-1v-3l2.293-2.293-2.292-2.292a1 1 0 011.414-1.414L5.707 9.293H8a1 1 0 011-1V6.586l-2.293-2.293a1 1 0 011.414-1.414L9 5.586V3.007a1 1 0 011-1h1.99z" />
  </svg>
);

export default CrownIcon;
