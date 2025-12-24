import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getDashboardData } from '@/lib/nodeData.server';

export default async function Home() {
  const data = await getDashboardData();
  return <DashboardClient initialData={data} />;
}
