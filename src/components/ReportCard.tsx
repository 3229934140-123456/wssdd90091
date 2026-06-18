import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Check, X, Globe, FileText, Type, AlertCircle } from 'lucide-react';
import type { Report, SentimentType, MediaLevel, ReachScope } from '../../shared/types';
import { SENTIMENT_CONFIG, MEDIA_LEVEL_CONFIG, REACH_SCOPE_CONFIG, formatDateTime, formatFullDateTime, getTimeAgo } from '../../shared/constants';
import { SentimentBadge, MediaLevelBadge, ReachScopeBadge, SubjectTag } from './Badges';
import { useSentimentStore } from '../store/sentimentStore';

const sentimentOptions: SentimentType[] = ['positive', 'neutral', 'doubtful', 'negative', 'risk'];
const mediaLevelOptions: MediaLevel[] = ['national', 'finance', 'portal', 'selfmedia', 'industry'];
const reachScopeOptions: ReachScope[] = ['local', 'regional', 'national', 'viral'];

const sourceIcons = {
  url: Globe,
  file: FileText,
  manual: Type,
};

const sourceLabels = {
  url: '链接导入',
  file: '剪报上传',
  manual: '手动录入',
};

interface ReportCardProps {
  report: Report;
  index: number;
}

export default function ReportCard({ report, index }: ReportCardProps) {
  const [expanded, setExpanded] = useState(index < 2);
  const [editing, setEditing] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const updateReport = useSentimentStore(s => s.updateReport);
  const updateReportSentiment = useSentimentStore(s => s.updateReportSentiment);
  const updateReportSubjects = useSentimentStore(s => s.updateReportSubjects);
  const updateReportMediaLevel = useSentimentStore(s => s.updateReportMediaLevel);
  const updateReportReachScope = useSentimentStore(s => s.updateReportReachScope);

  const SourceIcon = sourceIcons[report.source];
  const changed = report.sentiment !== report.originalSentiment;

  const highlightContent = (text: string) => {
    let result = text;
    const sortedSentences = [...report.keySentences].sort((a, b) => b.position - a.position);
    for (const ks of sortedSentences) {
      if (result.includes(ks.text)) {
        result = result.replace(ks.text, `<mark class="highlight-text" title="${ks.reason}">${ks.text}</mark>`);
      }
    }
    return result;
  };

  const addSubject = () => {
    if (newSubject.trim() && !report.subjects.includes(newSubject.trim())) {
      updateReportSubjects(report.id, [...report.subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (s: string) => {
    updateReportSubjects(report.id, report.subjects.filter(x => x !== s));
  };

  return (
    <div
      className="card animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${changed ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
              <SourceIcon className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-semibold text-base leading-snug text-gray-900 mb-1.5">
                  {report.title}
                </h3>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="font-medium text-navy-700">{report.mediaName}</span>
                  <MediaLevelBadge level={report.mediaLevel} />
                  <span className="font-mono">{formatDateTime(report.publishTime)}</span>
                  <span>· {sourceLabels[report.source]}</span>
                  {changed && (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      已人工修正
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SentimentBadge sentiment={report.sentiment} size="md" />
                <button
                  onClick={() => setEditing(!editing)}
                  className={`p-1.5 rounded-sm transition-colors ${editing ? 'bg-navy-100 text-navy-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                  title="修正信息"
                >
                  <Edit3 className="w-4 h-4" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-sm transition-colors"
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {editing && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm animate-fade-in">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      倾向判定
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {sentimentOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => updateReportSentiment(report.id, opt)}
                          className={`px-2.5 py-1 text-xs rounded-sm border transition-colors ${report.sentiment === opt ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                          style={report.sentiment === opt ? { backgroundColor: SENTIMENT_CONFIG[opt].color } : {}}
                        >
                          {SENTIMENT_CONFIG[opt].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      媒体级别
                    </label>
                    <select
                      value={report.mediaLevel}
                      onChange={(e) => updateReportMediaLevel(report.id, e.target.value as MediaLevel)}
                      className="select-field text-xs py-1.5"
                    >
                      {mediaLevelOptions.map(opt => (
                        <option key={opt} value={opt}>{MEDIA_LEVEL_CONFIG[opt].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      传播范围
                    </label>
                    <select
                      value={report.reachScope}
                      onChange={(e) => updateReportReachScope(report.id, e.target.value as ReachScope)}
                      className="select-field text-xs py-1.5"
                    >
                      {reachScopeOptions.map(opt => (
                        <option key={opt} value={opt}>{REACH_SCOPE_CONFIG[opt].label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    涉事主体
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {report.subjects.map(s => (
                        <SubjectTag key={s} label={s} onRemove={() => removeSubject(s)} />
                      ))}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                        placeholder="添加主体..."
                        className="w-32 px-2 py-1 text-xs border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-navy-500"
                      />
                      <button
                        onClick={addSubject}
                        className="px-2 py-1 text-xs bg-navy-700 text-white rounded-sm hover:bg-navy-800 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {expanded && (
              <div className="mt-4 animate-fade-in">
                <div className="text-sm text-gray-700 leading-relaxed mb-4">
                  {report.summary && <p className="mb-3">{report.summary}</p>}
                  {report.content && (
                    <p
                      className="text-gray-600 bg-gray-50 p-3 border-l-2 border-gray-200 text-sm"
                      dangerouslySetInnerHTML={{ __html: highlightContent(report.content) }}
                    />
                  )}
                </div>

                {report.keySentences.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-yellow-500" />
                      触发判断的关键句（{report.keySentences.length}条）
                    </p>
                    <div className="space-y-1.5">
                      {report.keySentences.map((ks, i) => (
                        <div key={ks.id} className="flex items-start gap-2 text-sm">
                          <span className="font-mono text-xs text-gray-400 mt-0.5">{i + 1}.</span>
                          <div className="flex-1">
                            <span className="highlight-text">{ks.text}</span>
                            <p className="text-xs text-gray-500 mt-0.5">— {ks.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <ReachScopeBadge scope={report.reachScope} />
                    <div className="flex items-center gap-1.5">
                      {report.subjects.map(s => (
                        <SubjectTag key={s} label={s} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                    <span>导入于 {getTimeAgo(report.createdAt)}</span>
                    {report.url && (
                      <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-navy-600 hover:underline">
                        查看原文
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
