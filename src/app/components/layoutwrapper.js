'use client';
import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import TransitionOverlay from './TransitionOverlay';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const showLayout = pathname !== '/login';

  return (
    <div className='w-screen'>
      <TransitionOverlay />
      {showLayout && <Navbar />}
      {children}
    </div>
  );
}
