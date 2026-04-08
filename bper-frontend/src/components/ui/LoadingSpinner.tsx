import React from 'react';

export const LoadingSpinner = ({ label = 'Loading...' }: { label?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full h-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corporateBlue"></div>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
};

export const CenteredLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <LoadingSpinner />
  </div>
);
