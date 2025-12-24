import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xandeum pNode Analytics',
  description: 'Analytics dashboard for Xandeum pNodes'
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </div>
  );
}
