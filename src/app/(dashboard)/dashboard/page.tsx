import WelcomeContainer from '@/components/dashboard/WelcomeContainer';
import StatsGrid from '@/components/dashboard/StatsGrid';
import AnalyticalPerformance from '@/components/dashboard/AnalyticalPerformance';
import LatestContentTable from '@/components/dashboard/LatestContentTable';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-[22px]">
      <WelcomeContainer />
      <StatsGrid />
      <AnalyticalPerformance />
      <LatestContentTable />
    </div>
  );
}
