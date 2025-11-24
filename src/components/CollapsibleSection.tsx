"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initialOpen?: boolean;
  count?: number; // Optional count to display next to the title
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, initialOpen = false, count }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-4 text-lg font-bold text-stone-800 hover:bg-stone-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="ml-2 px-2 py-0.5 text-sm font-medium bg-earth-100 text-earth-700 rounded-full">
              {count}
            </span>
          )}
        </span>
        <ChevronDown className={`h-5 w-5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;