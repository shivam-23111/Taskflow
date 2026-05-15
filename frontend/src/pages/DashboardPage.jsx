import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import {
  IoBarChartOutline,
  IoCalendarOutline,
  IoCheckboxOutline,
  IoCheckmarkCircleOutline,
  IoFolderOutline,
  IoPeopleOutline,
} from 'react-icons/io5';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Filler);

const toneStyles = {
  teal: {
    shell: 'border-primary-500/25 bg-primary-500/10',
    icon: 'text-primary-200',
    bar: 'bg-primary-400',
  },
  amber: {
    shell: 'border-amber-500/25 bg-amber-500/10',
    icon: 'text-amber-200',
    bar: 'bg-amber-400',
  },
  coral: {
    shell: 'border-coral-500/25 bg-coral-500/10',
    icon: 'text-coral-300',
    bar: 'bg-coral-400',
  },
  cyan: {
    shell: 'border-cyan-500/25 bg-cyan-500/10',
    icon: 'text-cyan-200',
    bar: 'bg-cyan-400',
  },
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const clampPercent = (value) => Math.max(0, Math.min(100, value || 0));

const getDistributionValue = (distribution = [], name) =>
  distribution.find((item) => item.name === name)?.value || 0;

const getDueLabel = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days}d left`;
};

const Panel = ({ title, action, children, className = '' }) => (
  <section className={`rounded-lg border border-dark-800 bg-dark-900 ${className}`}>
    <div className="flex items-center justify-between gap-3 border-b border-dark-800 px-5 py-4">
      <h3 className="text-sm font-semibold uppercase text-dark-300">{title}</h3>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const StatCard = ({ icon: Icon, label, value, detail, progress, tone = 'teal' }) => {
  const styles = toneStyles[tone] || toneStyles.teal;

  return (
    <div className="rounded-lg border border-dark-800 bg-dark-900 p-4 transition-colors hover:border-dark-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-dark-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-dark-50">{value}</p>
        </div>
        <div className={`rounded-lg border p-2.5 ${styles.shell}`}>
          <Icon size={22} className={styles.icon} />
        </div>
      </div>
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-dark-800">
          <div
            className={`h-full rounded-full ${styles.bar}`}
            style={{ width: `${clampPercent(progress)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-dark-500">{detail}</p>
      </div>
    </div>
  );
};

const SignalItem = ({ tone = 'teal', label, value, detail }) => {
  const styles = toneStyles[tone] || toneStyles.teal;

  return (
    <div className="flex items-center gap-3 rounded-md border border-dark-800 bg-dark-950/60 px-3 py-3">
      <span className={`h-2.5 w-2.5 rounded-full ${styles.bar}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-dark-100">{label}</p>
        <p className="truncate text-xs text-dark-500">{detail}</p>
      </div>
      <span className="text-sm font-bold text-dark-50">{value}</span>
    </div>
  );
};

const ProgressRow = ({ label, detail, value, tone = 'teal' }) => {
  const styles = toneStyles[tone] || toneStyles.teal;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-dark-100">{label}</p>
          {detail && <p className="truncate text-xs text-dark-500">{detail}</p>}
        </div>
        <span className="text-sm font-bold text-dark-50">{clampPercent(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-dark-800">
        <div
          className={`h-full rounded-full ${styles.bar}`}
          style={{ width: `${clampPercent(value)}%` }}
        />
      </div>
    </div>
  );
};

const EmptyState = ({ children }) => (
  <div className="rounded-md border border-dashed border-dark-700 px-4 py-8 text-center text-sm text-dark-500">
    {children}
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const metrics = useMemo(() => {
    if (!stats) return null;

    const totalTasks = stats.tasks.total || 0;
    const totalProjects = stats.projects.total || 0;
    const completedTasks = stats.tasks.completed || 0;
    const completedProjects = stats.projects.completed || 0;
    const highPriority = getDistributionValue(stats.taskPriorityDistribution, 'High');
    const openTasks = (stats.tasks.todo || 0) + (stats.tasks.inProgress || 0);
    const weeklyCompleted = stats.weeklyProgress.reduce(
      (sum, item) => sum + item.completed,
      0
    );
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const projectCompletionRate = totalProjects
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;
    const overdueRate = totalTasks ? Math.round((stats.tasks.overdue / totalTasks) * 100) : 0;
    const highPriorityRate = totalTasks ? Math.round((highPriority / totalTasks) * 100) : 0;
    const flowScore = clampPercent(
      Math.round(completionRate + projectCompletionRate * 0.25 - overdueRate * 0.55 - highPriorityRate * 0.25)
    );

    return {
      completionRate,
      projectCompletionRate,
      overdueRate,
      highPriority,
      openTasks,
      weeklyCompleted,
      flowScore,
    };
  }, [stats]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!stats || !metrics) {
    return <div className="py-20 text-center text-dark-400">Failed to load dashboard</div>;
  }

  const statusData = {
    labels: stats.taskStatusDistribution.map((item) => item.name),
    datasets: [
      {
        data: stats.taskStatusDistribution.map((item) => item.value),
        backgroundColor: ['#5b6f66', '#f5b84b', '#20c9a4'],
        borderColor: '#111713',
        borderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const priorityData = {
    labels: stats.taskPriorityDistribution.map((item) => item.name),
    datasets: [
      {
        data: stats.taskPriorityDistribution.map((item) => item.value),
        backgroundColor: ['#ff7c63', '#f5b84b', '#20c9a4'],
        borderColor: '#111713',
        borderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const barData = {
    labels: stats.weeklyProgress.map((item) => item.day),
    datasets: [
      {
        label: 'Completed',
        data: stats.weeklyProgress.map((item) => item.completed),
        backgroundColor: 'rgba(32, 201, 164, 0.45)',
        borderColor: '#20c9a4',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111713',
        borderColor: '#303c36',
        borderWidth: 1,
        titleColor: '#f7faf7',
        bodyColor: '#d2ddd5',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#83928a' },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#1b2420' },
        ticks: { color: '#83928a', stepSize: 1 },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#aebdb3',
          padding: 16,
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#111713',
        borderColor: '#303c36',
        borderWidth: 1,
        titleColor: '#f7faf7',
        bodyColor: '#d2ddd5',
      },
    },
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg border border-dark-800 bg-dark-900 p-5 lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-primary-300">
                {user?.role === 'admin' ? 'Admin command center' : 'Personal work console'}
              </p>
              <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-dark-50">
                Welcome back, {user?.name}. Your delivery picture is live.
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-dark-400">
                Track health, pressure, assignment load, and the next work that needs attention.
              </p>
            </div>
            <div className="rounded-lg border border-primary-500/25 bg-primary-500/10 p-4 text-right">
              <p className="text-xs font-semibold uppercase text-primary-300">Flow score</p>
              <p className="mt-1 text-4xl font-bold text-dark-50">{metrics.flowScore}</p>
              <p className="text-xs text-dark-500">Completion minus risk pressure</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <ProgressRow
              label="Task completion"
              detail={`${stats.tasks.completed} of ${stats.tasks.total} tasks closed`}
              value={metrics.completionRate}
              tone="teal"
            />
            <ProgressRow
              label="Project completion"
              detail={`${stats.projects.completed} of ${stats.projects.total} projects complete`}
              value={metrics.projectCompletionRate}
              tone="cyan"
            />
            <ProgressRow
              label="Overdue pressure"
              detail={`${stats.tasks.overdue} open tasks past due`}
              value={metrics.overdueRate}
              tone={stats.tasks.overdue ? 'coral' : 'teal'}
            />
          </div>
        </div>

        <Panel title="Focus Signals">
          <div className="space-y-3">
            <SignalItem
              tone={stats.tasks.overdue ? 'coral' : 'teal'}
              label="Overdue work"
              value={stats.tasks.overdue}
              detail="Open tasks behind schedule"
            />
            <SignalItem
              tone="amber"
              label="Due this week"
              value={stats.tasks.dueThisWeek || 0}
              detail="Upcoming incomplete tasks"
            />
            <SignalItem
              tone="coral"
              label="High priority"
              value={metrics.highPriority}
              detail="Tasks tagged as high"
            />
            <SignalItem
              tone="cyan"
              label="Weekly completions"
              value={metrics.weeklyCompleted}
              detail="Closed across the last 7 days"
            />
          </div>
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IoFolderOutline}
          label="Projects"
          value={stats.projects.total}
          detail={`${stats.projects.active} active, ${stats.projects.completed} completed`}
          progress={metrics.projectCompletionRate}
          tone="cyan"
        />
        <StatCard
          icon={IoCheckboxOutline}
          label="Open Work"
          value={metrics.openTasks}
          detail={`${stats.tasks.todo} todo, ${stats.tasks.inProgress} in progress`}
          progress={stats.tasks.total ? (metrics.openTasks / stats.tasks.total) * 100 : 0}
          tone="amber"
        />
        <StatCard
          icon={IoCheckmarkCircleOutline}
          label="Completed"
          value={stats.tasks.completed}
          detail={`${metrics.completionRate}% task completion`}
          progress={metrics.completionRate}
          tone="teal"
        />
        <StatCard
          icon={IoPeopleOutline}
          label="Team Load"
          value={stats.totalMembers}
          detail={`${stats.tasks.unassigned || 0} unassigned open tasks`}
          progress={stats.totalMembers ? Math.min(100, stats.totalMembers * 12) : 0}
          tone="coral"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Task Status">
          <div className="h-[270px]">
            {stats.tasks.total > 0 ? (
              <Doughnut data={statusData} options={doughnutOptions} />
            ) : (
              <EmptyState>No task status data yet</EmptyState>
            )}
          </div>
        </Panel>

        <Panel title="Priority Mix">
          <div className="h-[270px]">
            {stats.tasks.total > 0 ? (
              <Doughnut data={priorityData} options={doughnutOptions} />
            ) : (
              <EmptyState>No priority data yet</EmptyState>
            )}
          </div>
        </Panel>

        <Panel title="Weekly Throughput">
          <div className="h-[270px]">
            <Bar data={barData} options={chartOptions} />
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Panel title="Project Health">
          {stats.projectHealth?.length ? (
            <div className="space-y-4">
              {stats.projectHealth.map((project) => (
                <div
                  key={project._id}
                  className="rounded-lg border border-dark-800 bg-dark-950/50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold text-dark-50">
                          {project.title}
                        </p>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="mt-1 text-xs text-dark-500">
                        {project.taskTotal} tasks, {project.membersCount} members, due{' '}
                        {formatDate(project.deadline)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`rounded-md px-2 py-1 font-semibold ${
                          project.daysLeft < 0
                            ? 'bg-coral-500/15 text-coral-300'
                            : 'bg-amber-500/15 text-amber-200'
                        }`}
                      >
                        {project.daysLeft < 0
                          ? `${Math.abs(project.daysLeft)}d late`
                          : `${project.daysLeft}d left`}
                      </span>
                      {project.highPriorityTasks > 0 && (
                        <span className="rounded-md bg-coral-500/15 px-2 py-1 font-semibold text-coral-300">
                          {project.highPriorityTasks} high
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProgressRow
                      label="Completion"
                      detail={`${project.completedTasks} completed, ${project.inProgressTasks} in progress, ${project.overdueTasks} overdue`}
                      value={project.completionRate}
                      tone={project.overdueTasks ? 'coral' : 'teal'}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No project health data yet</EmptyState>
          )}
        </Panel>

        <Panel title="Workload">
          {stats.workloadByMember?.length ? (
            <div className="space-y-3">
              {stats.workloadByMember.map((member) => (
                <div
                  key={member._id}
                  className="rounded-lg border border-dark-800 bg-dark-950/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-amber-400 text-sm font-bold text-dark-950">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-dark-100">{member.name}</p>
                      <p className="truncate text-xs uppercase text-dark-500">{member.role}</p>
                    </div>
                    <span className="text-2xl font-bold text-dark-50">{member.openTasks}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-dark-900 px-2 py-2 text-dark-400">
                      <p className="font-bold text-coral-300">{member.highPriorityTasks}</p>
                      <p>High</p>
                    </div>
                    <div className="rounded-md bg-dark-900 px-2 py-2 text-dark-400">
                      <p className="font-bold text-amber-200">{member.dueSoonTasks}</p>
                      <p>Soon</p>
                    </div>
                    <div className="rounded-md bg-dark-900 px-2 py-2 text-dark-400">
                      <p className="font-bold text-coral-300">{member.overdueTasks}</p>
                      <p>Late</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No open workload to balance</EmptyState>
          )}
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Recent Task Activity"
          action={<IoBarChartOutline className="text-primary-300" size={18} />}
        >
          {stats.recentTasks.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex flex-col gap-3 rounded-lg border border-dark-800 bg-dark-950/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-dark-100">{task.title}</p>
                    <p className="mt-1 truncate text-xs text-dark-500">
                      {task.project?.title || 'No project'} assigned to{' '}
                      {task.assignedTo?.name || 'unassigned'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No tasks yet</EmptyState>
          )}
        </Panel>

        <Panel
          title="Deadline Radar"
          action={<IoCalendarOutline className="text-amber-300" size={18} />}
        >
          {stats.upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingDeadlines.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-dark-800 bg-dark-950/50 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-dark-100">{task.title}</p>
                    <p className="mt-1 truncate text-xs text-dark-500">
                      {task.project?.title || 'No project'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-amber-200">
                      {formatDate(task.dueDate)}
                    </p>
                    <p className="text-xs text-dark-500">{getDueLabel(task.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No upcoming deadlines</EmptyState>
          )}
        </Panel>
      </section>
    </div>
  );
};

export default DashboardPage;
