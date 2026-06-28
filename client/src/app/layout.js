import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Trao · AI Travel Planner',
  description:
    'Generate personalised, day-by-day travel itineraries with budgets and hotel picks, powered by an AI agent.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { borderRadius: '12px', fontSize: '14px' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
