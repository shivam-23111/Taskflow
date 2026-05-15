import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoPersonAddOutline,
  IoTrashOutline,
} from 'react-icons/io5';

const statuses = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const shortDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const isOverdue = (task) => task.status !== 'completed' && new Date(task.dueDate) < new Date();

const getDaysUntil = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?project=${id}`),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
      if (isAdmin) {
        const usersRes = await API.get('/users');
        setAllUsers(usersRes.data);
      }
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.dueDate) {
      toast.error('Title and due date required');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('/tasks', { ...taskForm, project: id });
      toast.success('Task created');
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        status: 'todo',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleAddMember = async (userId) => {
    const memberIds = [...(project.members?.map((member) => member._id) || []), userId];
    try {
      await API.put(`/projects/${id}/members`, { members: memberIds });
      toast.success('Member added');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const handleRemoveMember = async (userId) => {
    const memberIds = project.members?.filter((member) => member._id !== userId).map((member) => member._id) || [];
    try {
      await API.put(`/projects/${id}/members`, { members: memberIds });
      toast.success('Member removed');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const summary = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter((task) => task.status === 'in-progress').length;
    const overdue = tasks.filter((task) => isOverdue(task)).length;
    const high = tasks.filter((task) => task.priority === 'high').length;
    const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    return { completed, inProgress, overdue, high, completion };
  }, [tasks]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!project) return null;

  const nonMembers = allUsers.filter(
    (candidate) => !project.members?.some((member) => member._id === candidate._id)
  );
  const projectDaysLeft = getDaysUntil(project.deadline);
  const canUpdateTask = (task) =>
    user?.role === 'admin' || task.assignedTo?._id === user?._id;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 rounded-lg border border-dark-800 px-3 py-2 text-sm font-semibold text-dark-400 transition-colors hover:border-primary-700 hover:text-primary-200"
      >
        <IoArrowBackOutline size={16} />
        Back to Projects
      </button>

      <section className="rounded-lg border border-dark-800 bg-dark-900 p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-dark-50">{project.title}</h2>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-3 max-w-3xl text-sm text-dark-400">
              {project.description || 'No description added'}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-dark-400">
              <span className="inline-flex items-center gap-2 rounded-md border border-dark-800 bg-dark-950 px-3 py-2">
                <IoCalendarOutline size={16} className="text-amber-300" />
                Due {formatDate(project.deadline)}
              </span>
              <span
                className={`rounded-md px-3 py-2 font-semibold ${
                  projectDaysLeft < 0
                    ? 'bg-coral-500/15 text-coral-300'
                    : 'bg-amber-500/15 text-amber-200'
                }`}
              >
                {projectDaysLeft < 0
                  ? `${Math.abs(projectDaysLeft)} days late`
                  : `${projectDaysLeft} days left`}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowMemberModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-dark-800 px-3 py-2 text-sm font-semibold text-dark-300 transition-colors hover:border-primary-700 hover:text-primary-200"
              >
                <IoPersonAddOutline size={16} />
                Members
              </button>
              <button
                type="button"
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-dark-950 transition-colors hover:bg-primary-400"
              >
                <IoAddOutline size={16} />
                Add Task
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryTile icon={IoCheckmarkCircleOutline} label="Completion" value={`${summary.completion}%`} tone="teal" />
          <SummaryTile icon={IoAddOutline} label="In Progress" value={summary.inProgress} tone="amber" />
          <SummaryTile icon={IoAlertCircleOutline} label="Overdue" value={summary.overdue} tone="coral" />
          <SummaryTile icon={IoPersonAddOutline} label="Members" value={project.members?.length || 0} tone="cyan" />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark-300">Project task completion</p>
            <p className="text-sm font-bold text-dark-50">{summary.completed}/{tasks.length}</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-dark-800">
            <div
              className="h-full rounded-full bg-primary-400"
              style={{ width: `${summary.completion}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-dark-800 bg-dark-900 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase text-dark-300">Team Roster</h3>
            <p className="mt-1 text-xs text-dark-500">People assigned to this project</p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowMemberModal(true)}
              className="rounded-md border border-dark-800 px-3 py-2 text-xs font-semibold text-dark-300 transition-colors hover:border-primary-700 hover:text-primary-200"
            >
              Manage
            </button>
          )}
        </div>
        {project.members?.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {project.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 rounded-lg border border-dark-800 bg-dark-950/60 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-amber-400 text-sm font-bold text-dark-950">
                  {member.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-dark-100">{member.name}</p>
                  <p className="truncate text-xs uppercase text-dark-500">{member.role}</p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member._id)}
                    className="rounded-md border border-dark-800 px-2 py-1 text-xs font-semibold text-dark-500 transition-colors hover:border-coral-500/40 hover:text-coral-300"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-dark-700 py-8 text-center text-sm text-dark-600">
            No members added
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {statuses.map((status) => {
          const tasksByStatus = tasks.filter((task) => task.status === status.value);
          return (
            <div key={status.value} className="rounded-lg border border-dark-800 bg-dark-900">
              <div className="flex items-center justify-between border-b border-dark-800 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase text-dark-300">{status.label}</h3>
                  <p className="text-xs text-dark-500">{tasksByStatus.length} tasks</p>
                </div>
                <StatusBadge status={status.value} />
              </div>
              <div className="space-y-3 p-3">
                {tasksByStatus.length ? (
                  tasksByStatus.map((task) => (
                    <article
                      key={task._id}
                      className={`rounded-lg border bg-dark-950/60 p-4 ${
                        isOverdue(task) ? 'border-coral-500/40' : 'border-dark-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-dark-50">{task.title}</p>
                          {task.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-dark-500">{task.description}</p>
                          )}
                        </div>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-dark-500">
                        <span>Assigned: {task.assignedTo?.name || 'Unassigned'}</span>
                        <span className="text-dark-700">/</span>
                        <span
                          className={isOverdue(task) ? 'font-semibold text-coral-300' : 'text-dark-400'}
                        >
                          Due {shortDate(task.dueDate)}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        {canUpdateTask(task) ? (
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="min-w-0 flex-1 rounded-md border border-dark-700 bg-dark-900 px-3 py-2 text-xs font-semibold text-dark-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          >
                            {statuses.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={task.status} />
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task._id)}
                            className="rounded-md border border-dark-800 p-2 text-dark-500 transition-colors hover:border-coral-500/40 hover:text-coral-300"
                            aria-label="Delete task"
                          >
                            <IoTrashOutline size={16} />
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-dark-700 py-8 text-center text-sm text-dark-600">
                    No tasks in this lane
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">Title</label>
            <input
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Task title"
              className="w-full rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={2}
              className="w-full resize-none rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">Assign To</label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="w-full rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="">Unassigned</option>
                {project.members?.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-dark-950 transition-colors hover:bg-primary-400 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Members">
        <div className="space-y-5">
          {nonMembers.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-dark-300">Add Members</p>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {nonMembers.map((candidate) => (
                  <div
                    key={candidate._id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-dark-800 bg-dark-950/60 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-amber-400 text-xs font-bold text-dark-950">
                        {candidate.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-dark-100">{candidate.name}</p>
                        <p className="truncate text-xs text-dark-500">{candidate.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddMember(candidate._id)}
                      className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-dark-950 transition-colors hover:bg-primary-400"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-dark-300">
              Current Members ({project.members?.length || 0})
            </p>
            <div className="space-y-2">
              {project.members?.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-dark-800 bg-dark-950/60 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-amber-400 text-xs font-bold text-dark-950">
                      {member.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-dark-100">{member.name}</p>
                      <p className="truncate text-xs uppercase text-dark-500">{member.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member._id)}
                    className="rounded-md border border-coral-500/30 px-3 py-1.5 text-xs font-semibold text-coral-300 transition-colors hover:bg-coral-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
