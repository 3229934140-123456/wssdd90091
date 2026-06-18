import type { SentimentType, MediaLevel, ReachScope, EventPriority, DispatchStatus, RelationshipLevel } from '../../shared/types';
import { SENTIMENT_CONFIG, MEDIA_LEVEL_CONFIG, REACH_SCOPE_CONFIG, PRIORITY_CONFIG, DISPATCH_STATUS_CONFIG, RELATIONSHIP_CONFIG } from '../../shared/constants';
import { Smile, Meh, Frown } from 'lucide-react';

export function SentimentBadge({ sentiment, size = 'sm' }: { sentiment: SentimentType; size?: 'sm' | 'md' }) {
  const config = SENTIMENT_CONFIG[sentiment];
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span
      className={`inline-flex items-center ${sizeClass} font-medium rounded-sm border-l-2`}
      style={{ backgroundColor: `${config.color}14`, borderLeftColor: config.color, color: config.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}

export function MediaLevelBadge({ level }: { level: MediaLevel }) {
  const config = MEDIA_LEVEL_CONFIG[level];
  return (
    <span className={`tag ${config.color}`}>
      {config.label}
    </span>
  );
}

export function ReachScopeBadge({ scope }: { scope: ReachScope }) {
  const config = REACH_SCOPE_CONFIG[scope];
  return (
    <span className={`tag ${config.color}`}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: EventPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm ${config.bgColor} ${config.color} ${config.pulse ? 'animate-pulse-border' : ''}`}
    >
      {config.label}
    </span>
  );
}

export function DispatchStatusBadge({ status }: { status: DispatchStatus }) {
  const config = DISPATCH_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

export function RelationshipBadge({ relationship }: { relationship: RelationshipLevel }) {
  const config = RELATIONSHIP_CONFIG[relationship];
  const Icon = relationship === 'friendly' ? Smile : relationship === 'neutral' ? Meh : Frown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export function SubjectTag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-navy-50 text-navy-700 border border-navy-100 rounded-sm">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-navy-900 ml-0.5">×</button>
      )}
    </span>
  );
}
