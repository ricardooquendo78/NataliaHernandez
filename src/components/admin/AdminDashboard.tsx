import { AdminCalendar } from './AdminCalendar';
import { AdminHistory } from './AdminHistory';
import { AdminFinancials } from './AdminFinancials';
import { AdminClients } from './AdminClients';
import { AdminServices } from './AdminServices';
import { AdminRecoveries } from './AdminRecoveries';

interface AdminDashboardProps {
  tab: string;
  setTab: (t: any) => void;
}

export const AdminDashboard = ({ tab }: AdminDashboardProps) => {
  return (
    <div className="space-y-8">
      <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-stone-100 min-h-[60vh]">
        {tab === 'calendar' && <AdminCalendar />}
        {tab === 'history' && <AdminHistory />}
        {tab === 'financials' && <AdminFinancials />}
        {tab === 'clients' && <AdminClients />}
        {tab === 'services' && <AdminServices />}
        {tab === 'recoveries' && <AdminRecoveries />}
      </div>
    </div>
  );
};
