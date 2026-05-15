import {
  IoArrowDownOutline,
  IoArrowForwardOutline,
  IoArrowUpOutline,
} from 'react-icons/io5';

const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-coral-500/15 text-coral-300 border border-coral-500/30',
    medium: 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
    low: 'bg-primary-500/15 text-primary-200 border border-primary-500/30',
  };

  const icons = {
    high: IoArrowUpOutline,
    medium: IoArrowForwardOutline,
    low: IoArrowDownOutline,
  };

  const Icon = icons[priority] || IoArrowForwardOutline;
  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Normal';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
        styles[priority] || 'bg-dark-700 text-dark-300'
      }`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
};

export default PriorityBadge;
