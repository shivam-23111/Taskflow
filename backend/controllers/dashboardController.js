const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const getStartOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDaysUntil = (date, today) =>
  Math.ceil((new Date(date).getTime() - today.getTime()) / DAY_IN_MS);

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    let projectQuery = {};
    let taskQuery = {};

    // Members only see their own stats
    if (req.user.role === 'member') {
      projectQuery = { members: req.user._id };
      taskQuery = { assignedTo: req.user._id };
    }

    const today = getStartOfToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    // Project stats
    const totalProjects = await Project.countDocuments(projectQuery);
    const activeProjects = await Project.countDocuments({ ...projectQuery, status: 'active' });
    const completedProjects = await Project.countDocuments({ ...projectQuery, status: 'completed' });

    // Task stats
    const totalTasks = await Task.countDocuments(taskQuery);
    const todoTasks = await Task.countDocuments({ ...taskQuery, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'in-progress' });
    const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'completed' });
    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() },
    });
    const dueTodayTasks = await Task.countDocuments({
      ...taskQuery,
      status: { $ne: 'completed' },
      dueDate: { $gte: today, $lt: tomorrow },
    });
    const dueThisWeekTasks = await Task.countDocuments({
      ...taskQuery,
      status: { $ne: 'completed' },
      dueDate: { $gte: today, $lte: nextWeek },
    });
    const unassignedTasks =
      req.user.role === 'admin'
        ? await Task.countDocuments({
            status: { $ne: 'completed' },
            assignedTo: { $exists: false },
          })
        : 0;

    // Task status distribution for pie chart
    const taskStatusDistribution = [
      { name: 'Todo', value: todoTasks, color: '#6366f1' },
      { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
      { name: 'Completed', value: completedTasks, color: '#10b981' },
    ];

    // Task priority distribution
    const highPriority = await Task.countDocuments({ ...taskQuery, priority: 'high' });
    const mediumPriority = await Task.countDocuments({ ...taskQuery, priority: 'medium' });
    const lowPriority = await Task.countDocuments({ ...taskQuery, priority: 'low' });

    const taskPriorityDistribution = [
      { name: 'High', value: highPriority, color: '#ef4444' },
      { name: 'Medium', value: mediumPriority, color: '#f59e0b' },
      { name: 'Low', value: lowPriority, color: '#10b981' },
    ];

    // Weekly progress - tasks completed in the last 7 days
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const completed = await Task.countDocuments({
        ...taskQuery,
        status: 'completed',
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      });

      weeklyProgress.push({
        day: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        date: startOfDay.toISOString().split('T')[0],
        completed,
      });
    }

    // Team members count
    const totalMembers = await User.countDocuments();

    // Recent tasks
    const recentTasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming deadlines
    const upcomingDeadlines = await Task.find({
      ...taskQuery,
      status: { $ne: 'completed' },
      dueDate: { $gte: new Date() },
    })
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .sort({ dueDate: 1 })
      .limit(5);

    const projectHealthSource = await Project.find(projectQuery)
      .populate('members', 'name email role')
      .sort({ status: 1, deadline: 1 })
      .limit(6);

    const projectHealth = await Promise.all(
      projectHealthSource.map(async (project) => {
        const projectTaskQuery = { project: project._id };
        if (req.user.role === 'member') {
          projectTaskQuery.assignedTo = req.user._id;
        }

        const [
          taskTotal,
          completedForProject,
          inProgressForProject,
          overdueForProject,
          highPriorityForProject,
        ] = await Promise.all([
          Task.countDocuments(projectTaskQuery),
          Task.countDocuments({ ...projectTaskQuery, status: 'completed' }),
          Task.countDocuments({ ...projectTaskQuery, status: 'in-progress' }),
          Task.countDocuments({
            ...projectTaskQuery,
            status: { $ne: 'completed' },
            dueDate: { $lt: new Date() },
          }),
          Task.countDocuments({
            ...projectTaskQuery,
            status: { $ne: 'completed' },
            priority: 'high',
          }),
        ]);

        return {
          _id: project._id,
          title: project.title,
          status: project.status,
          deadline: project.deadline,
          membersCount: project.members?.length || 0,
          taskTotal,
          completedTasks: completedForProject,
          inProgressTasks: inProgressForProject,
          overdueTasks: overdueForProject,
          highPriorityTasks: highPriorityForProject,
          completionRate: taskTotal
            ? Math.round((completedForProject / taskTotal) * 100)
            : project.status === 'completed'
              ? 100
              : 0,
          daysLeft: getDaysUntil(project.deadline, today),
        };
      })
    );

    const openTasks = await Task.find({ ...taskQuery, status: { $ne: 'completed' } })
      .populate('assignedTo', 'name email role')
      .select('assignedTo priority dueDate status');

    const workloadMap = new Map();
    openTasks.forEach((task) => {
      const assignee = task.assignedTo;
      const key = assignee?._id?.toString() || 'unassigned';
      const record = workloadMap.get(key) || {
        _id: key,
        name: assignee?.name || 'Unassigned',
        email: assignee?.email || '',
        role: assignee?.role || 'unassigned',
        openTasks: 0,
        highPriorityTasks: 0,
        overdueTasks: 0,
        dueSoonTasks: 0,
      };

      record.openTasks += 1;
      if (task.priority === 'high') record.highPriorityTasks += 1;
      if (task.dueDate < new Date()) record.overdueTasks += 1;
      if (task.dueDate >= today && task.dueDate <= nextWeek) record.dueSoonTasks += 1;

      workloadMap.set(key, record);
    });

    const workloadByMember = Array.from(workloadMap.values())
      .sort((a, b) => b.openTasks - a.openTasks)
      .slice(0, 6);

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
      },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        dueToday: dueTodayTasks,
        dueThisWeek: dueThisWeekTasks,
        unassigned: unassignedTasks,
      },
      taskStatusDistribution,
      taskPriorityDistribution,
      weeklyProgress,
      totalMembers,
      recentTasks,
      upcomingDeadlines,
      projectHealth,
      workloadByMember,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
