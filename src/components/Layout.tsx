import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
