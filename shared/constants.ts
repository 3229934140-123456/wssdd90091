import type { SentimentType, MediaLevel, ReachScope, DispatchStatus, EventPriority, EscalationLevel, RelationshipLevel, ContactCommStatus } from './types';

export const SENTIMENT_CONFIG: Record<SentimentType, { label: string; color: string; bgColor: string; borderColor: string; textColor: string }> = {
  positive: { label: '正面', color: '#059669', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500', textColor: 'text-emerald-700' },
  neutral: { label: '中性', color: '#6b7280', bgColor: 'bg-gray-50', borderColor: 'border-gray-500', textColor: 'text-gray-700' },
  negative: { label: '负面', color: '#dc2626', bgColor: 'bg-red-50', borderColor: 'border-red-500', textColor: 'text-red-700' },
  doubtful: { label: '质疑', color: '#f59e0b', bgColor: 'bg-amber-50', borderColor: 'border-amber-500', textColor: 'text-amber-700' },
  risk: { label: '风险提示', color: '#b91c1c', bgColor: 'bg-red-100', borderColor: 'border-red-700', textColor: 'text-red-800' }
};

export const MEDIA_LEVEL_CONFIG: Record<MediaLevel, { label: string; color: string }> = {
  national: { label: '央媒/官方', color: 'text-red-700' },
  finance: { label: '财经媒体', color: 'text-blue-700' },
  portal: { label: '门户网站', color: 'text-purple-700' },
  selfmedia: { label: '自媒体', color: 'text-orange-700' },
  industry: { label: '行业媒体', color: 'text-green-700' }
};

export const REACH_SCOPE_CONFIG: Record<ReachScope, { label: string; color: string }> = {
  local: { label: '本地', color: 'text-gray-600' },
  regional: { label: '区域', color: 'text-blue-600' },
  national: { label: '全国', color: 'text-amber-600' },
  viral: { label: '全网传播', color: 'text-red-600' }
};

export const DISPATCH_STATUS_CONFIG: Record<DispatchStatus, { label: string; color: string; dotColor: string }> = {
  pending: { label: '待观察', color: 'text-gray-600', dotColor: 'bg-gray-400' },
  responding: { label: '已响应', color: 'text-amber-600', dotColor: 'bg-amber-500' },
  responded: { label: '已回应', color: 'text-blue-600', dotColor: 'bg-blue-500' },
  closed: { label: '已闭环', color: 'text-emerald-600', dotColor: 'bg-emerald-500' }
};

export const PRIORITY_CONFIG: Record<EventPriority, { label: string; color: string; bgColor: string; pulse?: boolean }> = {
  low: { label: '低', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  medium: { label: '中', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  high: { label: '高', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  critical: { label: '紧急', color: 'text-red-700', bgColor: 'bg-red-50', pulse: true }
};

export const ESCALATION_CONFIG: Record<EscalationLevel, { label: string; color: string }> = {
  normal: { label: '常规处理', color: 'text-gray-600' },
  manager: { label: '经理级', color: 'text-blue-600' },
  director: { label: '总监级', color: 'text-amber-600' },
  executive: { label: '高管层', color: 'text-red-600' }
};

export const RELATIONSHIP_CONFIG: Record<RelationshipLevel, { label: string; color: string; icon: string }> = {
  friendly: { label: '友好', color: 'text-emerald-600', icon: 'smile' },
  neutral: { label: '中立', color: 'text-gray-600', icon: 'meh' },
  difficult: { label: '难沟通', color: 'text-red-600', icon: 'frown' }
};

export const COMM_STATUS_CONFIG: Record<ContactCommStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待联系', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  contacted: { label: '已联系', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  responded: { label: '已回复', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  declined: { label: '拒绝沟通', color: 'text-red-600', bgColor: 'bg-red-100' }
};

export const VOICE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  official: { label: '官方表态', color: 'text-indigo-600' },
  regulator: { label: '监管声音', color: 'text-red-600' },
  consumer: { label: '消费者反馈', color: 'text-orange-600' },
  expert: { label: '专家评论', color: 'text-purple-600' },
  media: { label: '媒体报道', color: 'text-gray-600' }
};

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

export function formatFullDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDateTime(dateStr);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
