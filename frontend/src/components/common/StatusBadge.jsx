const StatusBadge = ({ status }) => {
  const styles = {
    todo: 'bg-dark-800 text-dark-300 border border-dark-700',
    'in-progress': 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
    completed: 'bg-primary-500/15 text-primary-200 border border-primary-500/30',
    active: 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30',
  };

  const labels = {
    todo: 'Todo',
    'in-progress': 'In Progress',
    completed: 'Completed',
    active: 'Active',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
        styles[status] || 'bg-dark-700 text-dark-300'
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
