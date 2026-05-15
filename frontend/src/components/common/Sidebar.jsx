import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  IoBarChartOutline,
  IoCheckboxOutline,
  IoCloseOutline,
  IoFolderOutline,
  IoLogOutOutline,
  IoPersonOutline,
  IoPulseOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi2';

const navItems = [
  {
    to: '/dashboard',
    icon: IoBarChartOutline,
    label: 'Command Center',
    description: 'Live delivery signals',
  },
  {
    to: '/projects',
    icon: IoFolderOutline,
    label: 'Projects',
    description: 'Roadmaps and teams',
  },
  {
    to: '/tasks',
    icon: IoCheckboxOutline,
    label: 'Task Board',
    description: 'Priorities and deadlines',
  },
  {
    to: '/profile',
    icon: IoPersonOutline,
    label: 'Profile',
    description: 'Account and access',
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 bg-dark-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-[288px] flex-col border-r border-dark-800/80 bg-dark-950/95 shadow-2xl shadow-black/30 backdrop-blur-xl transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-dark-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-500/15 shadow-lg shadow-primary-950/20">
              <HiOutlineSparkles className="text-xl text-primary-200" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight text-dark-50">TaskFlow</p>
              <p className="text-xs font-medium uppercase text-primary-300">Delivery OS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg border border-dark-800 p-2 text-dark-400 transition-colors hover:border-primary-700 hover:text-dark-100 lg:hidden"
          >
            <IoCloseOutline size={20} />
          </button>
        </div>

        <div className="border-b border-dark-800/80 px-5 py-4">
          <div className="flex items-center gap-2 rounded-lg border border-dark-800 bg-dark-900 px-3 py-2.5 text-dark-500">
            <IoSearchOutline size={17} />
            <span className="text-sm">Find work, projects, people</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase text-dark-500">
            Workspace
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg border px-3 py-3 transition-all duration-200 ${
                    isActive
                      ? 'border-primary-500/50 bg-primary-500/10 text-dark-50 shadow-lg shadow-primary-950/20'
                      : 'border-transparent text-dark-400 hover:border-dark-700 hover:bg-dark-900 hover:text-dark-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isActive
                          ? 'border-primary-400/40 bg-primary-400/15 text-primary-200'
                          : 'border-dark-800 bg-dark-900 text-dark-400 group-hover:border-primary-800 group-hover:text-primary-300'
                      }`}
                    >
                      <item.icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      <span className="block truncate text-xs text-dark-500">
                        {item.description}
                      </span>
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-dark-800/80 p-3">
          <div className="rounded-lg border border-dark-800 bg-dark-900 p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-amber-400 text-sm font-bold text-dark-950">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-dark-100">{user?.name}</p>
                <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-primary-300">
                  <IoPulseOutline size={12} />
                  {user?.role || 'member'}
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-dark-800 p-2 text-dark-500 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                title="Logout"
                aria-label="Logout"
              >
                <IoLogOutOutline size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <NavLink
                to="/projects"
                onClick={onClose}
                className="rounded-md border border-dark-800 px-2 py-2 text-center font-medium text-dark-300 transition-colors hover:border-primary-700 hover:text-primary-200"
              >
                Projects
              </NavLink>
              <NavLink
                to="/tasks"
                onClick={onClose}
                className="rounded-md border border-dark-800 px-2 py-2 text-center font-medium text-dark-300 transition-colors hover:border-amber-600 hover:text-amber-200"
              >
                Tasks
              </NavLink>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
