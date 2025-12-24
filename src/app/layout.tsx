import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/lib/font';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xandeum pNode Analytics',
  description: 'Analytics dashboard for Xandeum pNodes'
};

export const viewport: Viewport = {
  themeColor: '#09090b'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='dark' suppressHydrationWarning>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontVariables)}>
        <NextTopLoader
          color='#3b82f6'
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing='ease'
          speed={200}
          shadow='0 0 10px #3b82f6,0 0 5px #3b82f6'
        />
        <div className='relative flex min-h-screen flex-col'>
          {children}
          <Toaster position='top-center' />
        </div>
      </body>
    </html>
  );
}
