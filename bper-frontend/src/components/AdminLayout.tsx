import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export const AdminLayout = ({ hideTopNav = false }: { hideTopNav?: boolean }) => {
  return (
    <div className="flex bg-slate-100 min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {!hideTopNav && <TopNav />}
        <Outlet />
      </div>
    </div>
  );
};
