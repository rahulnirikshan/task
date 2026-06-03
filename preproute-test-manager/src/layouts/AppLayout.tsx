import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MESSAGES } from '@/constants/messages';
import { logout } from '@/features/auth/authSlice';
import type { RootState } from '@/app/store';

const pageTitles: Record<string, string> = {
  '/dashboard': MESSAGES.test.myTests,
  '/tests/create': MESSAGES.test.createNew,
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    toast.success(MESSAGES.auth.logoutSuccess);
    navigate('/login');
  };

  const title =
    pageTitles[location.pathname] ??
    (location.pathname.includes('/edit')
      ? MESSAGES.test.editTest
      : location.pathname.includes('/questions')
        ? MESSAGES.test.wizardStepQuestions
        : location.pathname.includes('/preview')
          ? MESSAGES.test.previewTitle
          : MESSAGES.layout.pageTitle);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <span className="text-lg font-bold text-primary">{MESSAGES.auth.appName}</span>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-50 hover:text-primary"
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            {MESSAGES.common.dashboard}
          </Link>
        </nav>
        <div className="absolute bottom-0 w-full border-t p-4">
          {user?.name && (
            <p className="mb-2 truncate text-xs text-muted-foreground">{user.name}</p>
          )}
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {MESSAGES.common.logout}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{title}</h2>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
