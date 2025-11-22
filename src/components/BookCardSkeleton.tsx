"use client";

import React from 'react';

const BookCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col h-full overflow-hidden animate-pulse">
      {/* Header / Cover Placeholder */}
      <div className="h-32 bg-stone-100 relative p-4 flex flex-col justify-end">
        <div className="absolute -bottom-6 left-4 w-16 h-24 bg-stone-200 rounded-md shadow-lg border-2 border-white"></div>
      </div>

      <div className="pt-8 px-4 pb-4 flex-1 flex flex-col">
        <div className="mb-2">
            <div className="h-4 w-20 bg-stone-100 rounded-full"></div>
        </div>

        <div className="h-5 w-3/4 bg-stone-200 rounded mb-1"></div>
        <div className="h-4 w-1/2 bg-stone-100 rounded mb-3"></div>

        <div className="mt-auto space-y-3">
            <div className="h-2 w-full bg-stone-100 rounded-full"></div>
            <div className="h-2 w-3/4 bg-stone-100 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BookCardSkeleton;