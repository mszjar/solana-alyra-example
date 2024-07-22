// SideLink.tsx
import React from 'react';
import './SideLink.css';

interface SideLinkProps {
  id: number;
  imgSrc: string;
  label: string;
  category: number;
  setCategory: React.Dispatch<React.SetStateAction<number>>;
}

const SideLink: React.FC<SideLinkProps> = ({ id,imgSrc, label, category, setCategory }) => (
  <div className={`side-link ${category ===id ? "active": ""} `} onClick={()=> setCategory(id)}>
    <img src={imgSrc} alt={label} />
    <span>{label}</span>
  </div>
);

export default SideLink;
