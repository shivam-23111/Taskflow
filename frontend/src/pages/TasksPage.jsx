import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoFunnelOutline,
  IoGridOutline,
  IoListOutline,
  IoSearchOutline,
} from 'react-icons/io5';

const statuses = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const isOverdue = (dueDate, status) =>
  status !== 'completed' && new Date(dueDate) < new Date();

const daysUntil = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getDueLabel = (task) => {
  if (task.status === 'completed') return 'Closed';
  const days = daysUntil(task.dueDate);
  if (days < 0) return `${Math.abs(days)}d late`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days}d left`;
};

const SummaryTile = ({ icon: Icon, label, value, tone = 'teal' }) => {
  const tones = {
    teal: 'border-primary-500/25 bg-primary-500/10 text-primary-200',
    amber: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
    coral: 'border-coral-500/25 bg-coral-500/10 text-coral-300',
    cyan: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone] || tones.teal}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase opacity-80">{label}</p>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-3xl font-bold text-dark-50">{value}</p>
    </div>
  );
};

const TaskCard = ({ task, canUpdate, onStatusChange }) => (
  <article
    className={`rounded-lg border bg-dark-950/60 p-4 transition-colors hover:bg-dark-950 ${
      isOverdue(task.dueDate, task.status) ? 'border-coral-500/40' : 'border-dark-800'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-dark-50">{task.title}</h3>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-dark-500">{task.description}</p>
        )}
      </div>
      <PriorityBadge priority={task.priority} />
    </div>

    <div className="mt-4 space-y-2 text-xs text-dark-500">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate">{task.project?.title || 'No project'}</span>
        <span className={isOverdue(task.dueDate, task.status) ? 'font-semibold text-coral-300' : 'text-dark-400'}>
          {getDueLabel(task)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="truncate">Assigned to {task.assignedTo?.name || 'unassigned'}</span>
        <span>{formatDate(task.dueDate)}</span>
      </div>
    </div>

    <div className="mt-4">
      {canUpdate ? (
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="w-full rounded-md border border-dark-700 bg-dark-900 px-3 py-2 text-xs font-semibold text-dark-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      ) : (
        <StatusBadge status={task.status} />
      )}
    </div>
  </article>
);

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [viewMode, setViewMode] = useState('board');
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    try {
      let url = '/tasks?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      const { data } = await API.get(url);
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      toast.success('Status updated');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = tasks.filter((task) => {
      if (!query) return true;
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.project?.title?.toLowerCase().includes(query) ||
        task.assignedTo?.name?.toLowerCase().includes(query)
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'assignee') {
        return (a.assignedTo?.name || 'Unassigned').localeCompare(
          b.assignedTo?.name || 'Unassigned'
        );
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [search, sortBy, tasks]);

  const summary = useMemo(() => {
    const overdue = filteredTasks.filter((task) => isOverdue(task.dueDate, task.status)).length;
    const completed = filteredTasks.filter((task) => task.status === 'completed').length;
    const high = filteredTasks.filter((task) => task.priority === 'high').length;
    const unassigned = filteredTasks.filter((task) => !task.assignedTo).length;
    return { overdue, completed, high, unassigned };
  }, [filteredTasks]);

  const canUpdateTask = (task) =>
    user?.role === 'admin' || task.assignedTo?._id === user?._id;

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-dark-800 bg-dark-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary-300">Work Queue</p>
            <h2 className="mt-2 text-2xl font-bold text-dark-50">Task operations board</h2>
            <p className="mt-2 max-w-2xl text-sm text-dark-400">
              Filter, sort, and move work across status without leaving the task list.
            </p>
          </div>
          {(statusFilter || priorityFilter || search) && (
            <button
              type="button"
              onClick={() => {
                const hadRemoteFilters = statusFilter || priorityFilter;
                setStatusFilter('');
                setPriorityFilter('');
                setSearch('');
                if (hadRemoteFilters) setLoading(true);
              }}
              className="rounded-lg border border-dark-800 px-4 py-2 text-sm font-semibold text-dark-300 transition-colors hover:border-primary-700 hover:text-primary-200"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryTile icon={IoListOutline} label="Visible Tasks" value={filteredTasks.length} tone="cyan" />
          <SummaryTile icon={IoCheckmarkCircleOutline} label="Completed" value={summary.completed} tone="teal" />
          <SummaryTile icon={IoAlertCircleOutline} label="Overdue" value={summary.overdue} tone="coral" />
          <SummaryTile icon={IoFunnelOutline} label="High Priority" value={summary.high} tone="amber" />
        </div>
      </section>

      <section className="rounded-lg border border-dark-800 bg-dark-900 p-4">
        <div className="grid gap-3 xl:grid-cols-[1.25fr_0.6fr_0.6fr_0.7fr_auto]">
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, projects, assignees..."
              className="w-full rounded-lg border border-dark-800 bg-dark-950 py-2.5 pl-10 pr-4 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setLoading(true);
              setStatusFilter(e.target.value);
            }}
            className="rounded-lg border border-dark-800 bg-dark-950 px-3 py-2.5 text-sm text-dark-200 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">All status</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => {
              setLoading(true);
              setPriorityFilter(e.target.value);
            }}
            className="rounded-lg border border-dark-800 bg-dark-950 px-3 py-2.5 text-sm text-dark-200 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">All priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-dark-800 bg-dark-950 px-3 py-2.5 text-sm text-dark-200 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="deadline">Sort by due date</option>
            <option value="priority">Sort by priority</option>
            <option value="status">Sort by status</option>
            <option value="assignee">Sort by assignee</option>
          </select>
          <div className="grid grid-cols-2 rounded-lg border border-dark-800 bg-dark-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                viewMode === 'board'
                  ? 'bg-primary-500 text-dark-950'
                  : 'text-dark-400 hover:text-dark-100'
              }`}
              aria-label="Board view"
            >
              <IoGridOutline size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary-500 text-dark-950'
                  : 'text-dark-400 hover:text-dark-100'
              }`}
              aria-label="Table view"
            >
              <IoListOutline size={18} />
            </button>
          </div>
        </div>
      </section>

      {filteredTasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-dark-700 py-20 text-center">
          <p className="text-lg text-dark-500">No tasks found</p>
          <p className="mt-1 text-sm text-dark-600">
            {statusFilter || priorityFilter || search
              ? 'Try changing the filters'
              : 'Tasks will appear here when created'}
          </p>
        </div>
      ) : viewMode === 'board' ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {statuses.map((status) => {
            const tasksByStatus = filteredTasks.filter((task) => task.status === status.value);
            return (
              <section
                key={status.value}
                className="min-h-[280px] rounded-lg border border-dark-800 bg-dark-900"
              >
                <div className="flex items-center justify-between border-b border-dark-800 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-dark-300">{status.label}</h3>
                    <p className="text-xs text-dark-500">{tasksByStatus.length} tasks</p>
                  </div>
                  <StatusBadge status={status.value} />
                </div>
                <div className="space-y-3 p-3">
                  {tasksByStatus.length > 0 ? (
                    tasksByStatus.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        canUpdate={canUpdateTask(task)}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-dark-700 py-8 text-center text-sm text-dark-600">
                      No tasks in this lane
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-dark-800 bg-dark-900">
          <div className="hidden grid-cols-12 gap-4 border-b border-dark-800 bg-dark-950/60 px-5 py-3 text-xs font-semibold uppercase text-dark-500 md:grid">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-1">Due</div>
            <div className="col-span-2">Status</div>
          </div>

          <div className="divide-y divide-dark-800">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-dark-950/60 md:grid-cols-12 md:items-center md:gap-4 ${
                  isOverdue(task.dueDate, task.status) ? 'border-l-2 border-l-coral-500' : ''
                }`}
              >
                <div className="col-span-4 min-w-0">
                  <p className="truncate font-semibold text-dark-100">{task.title}</p>
                  {task.description && (
                    <p className="mt-0.5 truncate text-xs text-dark-500">{task.description}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-dark-400">{task.project?.title || 'None'}</span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary-400 to-amber-400 text-[11px] font-bold text-dark-950">
                          {task.assignedTo.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="truncate text-sm text-dark-300">{task.assignedTo.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-dark-600">Unassigned</span>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="col-span-1">
                  <span
                    className={`text-xs ${
                      isOverdue(task.dueDate, task.status)
                        ? 'font-semibold text-coral-300'
                        : 'text-dark-400'
                    }`}
                  >
                    {formatDate(task.dueDate)}
                  </span>
                </div>
                <div className="col-span-2">
                  {canUpdateTask(task) ? (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="w-full rounded-md border border-dark-700 bg-dark-950 px-3 py-2 text-xs font-semibold text-dark-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={task.status} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
