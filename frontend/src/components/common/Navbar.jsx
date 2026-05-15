import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  IoAddOutline,
  IoCalendarOutline,
  IoMenuOutline,
  IoNotificationsOutline,
  IoSearchOutline,
} from 'react-icons/io5';

const Navbar = ({ onMenuToggle, pageTitle }) => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 border-b border-dark-800/80 bg-dark-950/85 px-4 backdrop-blur-xl sm:px-5 lg:px-8">
      <div className="flex h-20 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Open navigation"
            className="rounded-lg border border-dark-800 p-2 text-dark-400 transition-colors hover:border-primary-700 hover:bg-dark-900 hover:text-dark-100 lg:hidden"
          >
            <IoMenuOutline size={22} />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary-300">
              Workspace
            </p>
            <h1 className="truncate text-xl font-bold text-dark-50">{pageTitle}</h1>
          </div>
        </div>

        <div className="hidden min-w-[280px] max-w-sm flex-1 xl:block">
          <div className="flex items-center gap-2 rounded-lg border border-dark-800 bg-dark-900 px-3 py-2.5 text-dark-500">
            <IoSearchOutline size={17} />
            <span className="text-sm">Search current workspace</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-dark-800 bg-dark-900 px-3 py-2 text-sm text-dark-300 md:flex">
            <IoCalendarOutline size={17} className="text-amber-300" />
            <span>{today}</span>
          </div>
          <Link
            to="/projects"
            className="hidden items-center gap-1.5 rounded-lg border border-primary-500/40 bg-primary-500/10 px-3 py-2 text-sm font-semibold text-primary-200 transition-colors hover:bg-primary-500/20 sm:flex"
          >
            <IoAddOutline size={18} />
            Project
          </Link>
          <Link
            to="/tasks"
            aria-label="Open task signals"
            className="relative rounded-lg border border-dark-800 bg-dark-900 p-2.5 text-dark-400 transition-colors hover:border-amber-600/70 hover:text-amber-200"
          >
            <IoNotificationsOutline size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral-400" />
          </Link>
          <div className="hidden items-center gap-2 rounded-lg border border-dark-800 bg-dark-900 px-3 py-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary-400 to-amber-400 text-xs font-bold text-dark-950">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="max-w-[140px] truncate text-sm font-semibold leading-tight text-dark-100">
                {user?.name}
              </p>
              <p className="text-[11px] font-medium uppercase leading-tight text-dark-500">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
