'use client';

import { ReactNode } from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  currentPath?: string;
  showHeader?: boolean;
}

export default function MainLayout({ 
  children, 
  currentPath = '/', 
  showHeader = true 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {showHeader && <Header currentPath={currentPath} />}
      
      {/* Main Content with padding for fixed header */}
      <main className={showHeader ? "pt-20" : ""}>
        {children}
      </main>
    </div>
  );
}