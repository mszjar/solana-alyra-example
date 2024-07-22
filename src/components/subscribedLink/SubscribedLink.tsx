// SubscribedLink.tsx
import React from 'react';

interface SubscribedLinkProps {
  imgSrc: string;
  label: string;
}

const SubscribedLink: React.FC<SubscribedLinkProps> = ({ imgSrc, label }) => (
  <div className="side-link">
    <img src={imgSrc} alt={label} />
    <span>{label}</span>
  </div>
);

export default SubscribedLink;
