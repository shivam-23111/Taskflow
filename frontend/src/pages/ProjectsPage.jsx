import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  IoAddOutline,
  IoCalendarOutline,
  IoGridOutline,
  IoListOutline,
  IoPencilOutline,
  IoSearchOutline,
  IoTrashOutline,
} from 'react-icons/io5';

const getDaysUntil = (deadline) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getDeadlineTone = (project) => {
  if (project.status === 'completed') {
    return { label: 'Closed', className: 'bg-primary-500/15 text-primary-200' };
  }

  const days = getDaysUntil(project.deadline);
  if (days < 0) return { label: `${Math.abs(days)}d late`, className: 'bg-coral-500/15 text-coral-300' };
  if (days === 0) return { label: 'Due today', className: 'bg-coral-500/15 text-coral-300' };
  if (days <= 7) return { label: `${days}d left`, className: 'bg-amber-500/15 text-amber-200' };
  return { label: `${days}d left`, className: 'bg-dark-800 text-dark-300' };
};

const SummaryTile = ({ label, value, detail, tone = 'teal' }) => {
  const tones = {
    teal: 'border-primary-500/25 bg-primary-500/10 text-primary-200',
    amber: 'border-amber-500/25 bg-amber-500/10 text-amber-200',
    coral: 'border-coral-500/25 bg-coral-500/10 text-coral-300',
    cyan: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone] || tones.teal}`}>
      <p className="text-xs font-semibold uppercase opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-bold text-dark-50">{value}</p>
      <p className="mt-1 text-xs text-dark-500">{detail}</p>
    </div>
  );
};

const MemberStack = ({ members = [] }) => (
  <div className="flex items-center">
    {members.slice(0, 4).map((member, index) => (
      <div
        key={member._id || index}
        className="-ml-2 flex h-7 w-7 first:ml-0 items-center justify-center rounded-md border border-dark-900 bg-gradient-to-br from-primary-400 to-amber-400 text-[11px] font-bold text-dark-950"
      >
        {member.name?.charAt(0)?.toUpperCase()}
      </div>
    ))}
    {members.length > 4 && (
      <span className="ml-2 text-xs font-semibold text-dark-500">+{members.length - 4}</span>
    )}
  </div>
);

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [viewMode, setViewMode] = useState('grid');
  const [form, setForm] = useState({ title: '', description: '', deadline: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.deadline) {
      toast.error('Title and deadline are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editProject) {
        await API.put(`/projects/${editProject._id}`, form);
        toast.success('Project updated');
      } else {
        await API.post('/projects', form);
        toast.success('Project created');
      }
      setShowModal(false);
      setEditProject(null);
      setForm({ title: '', description: '', deadline: '', status: 'active' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      title: project.title,
      description: project.description,
      deadline: project.deadline?.split('T')[0],
      status: project.status,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditProject(null);
    setForm({ title: '', description: '', deadline: '', status: 'active' });
    setShowModal(true);
  };

  const summary = useMemo(() => {
    const active = projects.filter((project) => project.status === 'active').length;
    const completed = projects.filter((project) => project.status === 'completed').length;
    const dueSoon = projects.filter(
      (project) =>
        project.status !== 'completed' &&
        getDaysUntil(project.deadline) >= 0 &&
        getDaysUntil(project.deadline) <= 7
    ).length;
    const overdue = projects.filter(
      (project) => project.status !== 'completed' && getDaysUntil(project.deadline) < 0
    ).length;

    return { active, completed, dueSoon, overdue };
  }, [projects]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'team') return (b.members?.length || 0) - (a.members?.length || 0);
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [projects, search, sortBy, statusFilter]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-dark-800 bg-dark-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary-300">Portfolio</p>
            <h2 className="mt-2 text-2xl font-bold text-dark-50">Project control room</h2>
            <p className="mt-2 max-w-2xl text-sm text-dark-400">
              Scan ownership, deadlines, and status without changing the project workflow.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-dark-950 shadow-lg shadow-primary-950/20 transition-colors hover:bg-primary-400"
            >
              <IoAddOutline size={20} />
              New Project
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryTile label="Active" value={summary.active} detail="Projects in motion" tone="cyan" />
          <SummaryTile label="Completed" value={summary.completed} detail="Closed projects" tone="teal" />
          <SummaryTile label="Due Soon" value={summary.dueSoon} detail="Deadline within 7 days" tone="amber" />
          <SummaryTile label="Overdue" value={summary.overdue} detail="Past deadline" tone="coral" />
        </div>
      </section>

      <section className="rounded-lg border border-dark-800 bg-dark-900 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr_auto]">
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-dark-800 bg-dark-950 py-2.5 pl-10 pr-4 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-dark-800 bg-dark-950 px-3 py-2.5 text-sm text-dark-200 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-dark-800 bg-dark-950 px-3 py-2.5 text-sm text-dark-200 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="deadline">Sort by deadline</option>
            <option value="title">Sort by title</option>
            <option value="status">Sort by status</option>
            <option value="team">Sort by team size</option>
          </select>
          <div className="grid grid-cols-2 rounded-lg border border-dark-800 bg-dark-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-dark-950'
                  : 'text-dark-400 hover:text-dark-100'
              }`}
              aria-label="Grid view"
            >
              <IoGridOutline size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-dark-950'
                  : 'text-dark-400 hover:text-dark-100'
              }`}
              aria-label="List view"
            >
              <IoListOutline size={18} />
            </button>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-dark-700 py-20 text-center">
          <p className="text-lg text-dark-500">No projects found</p>
          {isAdmin && (
            <p className="mt-1 text-sm text-dark-600">Create your first project to get started</p>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => {
            const deadline = getDeadlineTone(project);
            return (
              <article
                key={project._id}
                className="rounded-lg border border-dark-800 bg-dark-900 p-5 transition-colors hover:border-primary-800"
              >
                <Link to={`/projects/${project._id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-dark-50">{project.title}</h3>
                      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-dark-400">
                        {project.description || 'No description added'}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border border-dark-800 bg-dark-950/60 p-3">
                      <p className="text-xs uppercase text-dark-500">Deadline</p>
                      <p className="mt-1 font-semibold text-dark-100">{formatDate(project.deadline)}</p>
                    </div>
                    <div className="rounded-md border border-dark-800 bg-dark-950/60 p-3">
                      <p className="text-xs uppercase text-dark-500">Team</p>
                      <p className="mt-1 font-semibold text-dark-100">{project.members?.length || 0} members</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <MemberStack members={project.members} />
                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${deadline.className}`}>
                      {deadline.label}
                    </span>
                  </div>
                </Link>

                {isAdmin && (
                  <div className="mt-5 flex items-center gap-2 border-t border-dark-800 pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(project)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-dark-800 px-3 py-2 text-xs font-semibold text-dark-300 transition-colors hover:border-primary-700 hover:text-primary-200"
                    >
                      <IoPencilOutline size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project._id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-dark-800 px-3 py-2 text-xs font-semibold text-dark-300 transition-colors hover:border-coral-500/40 hover:text-coral-300"
                    >
                      <IoTrashOutline size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-dark-800 bg-dark-900">
          <div className="hidden grid-cols-12 gap-4 border-b border-dark-800 bg-dark-950/60 px-5 py-3 text-xs font-semibold uppercase text-dark-500 md:grid">
            <div className="col-span-4">Project</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Team</div>
            <div className="col-span-2">Deadline</div>
            <div className="col-span-2">Pressure</div>
          </div>
          <div className="divide-y divide-dark-800">
            {filtered.map((project) => {
              const deadline = getDeadlineTone(project);
              return (
                <div
                  key={project._id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-dark-950/60 md:grid-cols-12 md:items-center md:gap-4"
                >
                  <Link to={`/projects/${project._id}`} className="col-span-4 min-w-0">
                    <p className="truncate font-semibold text-dark-50">{project.title}</p>
                    <p className="mt-1 truncate text-xs text-dark-500">
                      {project.description || 'No description added'}
                    </p>
                  </Link>
                  <div className="col-span-2">
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="col-span-2">
                    <MemberStack members={project.members} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm text-dark-300">
                    <IoCalendarOutline size={16} className="text-amber-300" />
                    {formatDate(project.deadline)}
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${deadline.className}`}>
                      {deadline.label}
                    </span>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(project)}
                          className="rounded-md border border-dark-800 p-2 text-dark-400 transition-colors hover:border-primary-700 hover:text-primary-200"
                          aria-label="Edit project"
                        >
                          <IoPencilOutline size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project._id)}
                          className="rounded-md border border-dark-800 p-2 text-dark-400 transition-colors hover:border-coral-500/40 hover:text-coral-300"
                          aria-label="Delete project"
                        >
                          <IoTrashOutline size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProject ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Project title"
              className="w-full rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Project description..."
              className="w-full resize-none rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-dark-700 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-dark-950 transition-colors hover:bg-primary-400 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : editProject ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
