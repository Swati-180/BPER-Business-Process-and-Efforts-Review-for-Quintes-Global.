import React from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from './EmployeeSidebar';
import { TopNav } from './TopNav';

export const EmployeeLayout = () => {
  return (
    <div className="flex bg-slate-100 min-h-screen font-sans">
      <EmployeeSidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNav />
        <Outlet />
      </div>
    </div>
  );
};
