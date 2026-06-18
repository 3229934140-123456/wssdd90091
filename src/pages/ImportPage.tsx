import { useState, useRef, ChangeEvent } from 'react';
import { Link, Upload, List, FileUp, Sparkles, Filter, TrendingUp, AlertTriangle, HelpCircle, ShieldAlert, CheckCircle2, FileText, CheckCircle, XCircle, AlertCircle, Edit3, Save, X, ChevronDown, ChevronUp, Eye, Plus, FolderOpen } from 'lucide-react';
import ReportCard from '../components/ReportCard';
import { useSentimentStore } from '../store/sentimentStore';
import { analyzeReport, analyzeUrlReport, analyzeFile, FileImportResult } from '../utils/analyzer';
import { SENTIMENT_CONFIG, MEDIA_LEVEL_CONFIG, REACH_SCOPE_CONFIG } from '../../shared/constants';
import type { SentimentType, MediaLevel, ReachScope, PendingReport, Report } from '../../shared/types';

type ImportTab = 'url' | 'file' | 'batch';

const tabs: { key: ImportTab; label: string; icon: typeof Link; desc: string }[] = [
  { key: 'url', label: '链接导入', icon: Link, desc: '粘贴新闻URL，系统自动提取来源信息' },
  { key: 'file', label: '剪报上传', icon: Upload, desc: '上传PDF/图片格式的媒体剪报' },
  { key: 'batch', label: '批量录入', icon: List, desc: '批量粘贴标题摘要，每行一条' },
];

const sentimentOptions: SentimentType[] = ['positive', 'neutral', 'doubtful', 'negative', 'risk'];

function PendingReportCard({
  report,
  onUpdate,
  onRemove,
  index,
  events,
  onNewEvent,
}: {
  report: PendingReport;
  onUpdate: (tempId: string, updates: Partial<PendingReport>) => void;
  onRemove: (tempId: string) => void;
  index: number;
  events: { id: string; name: string }[];
  onNewEvent: (tempId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(report.title);
  const [editContent, setEditContent] = useState(report.content);
  const [editMediaName, setEditMediaName] = useState(report.mediaName);
  const [newSubject, setNewSubject] = useState('');

  const config = SENTIMENT_CONFIG[report.sentiment];

  const handleSaveEdit = () => {
    onUpdate(report.tempId, {
      title: editTitle,
      content: editContent,
      mediaName: editMediaName,
      summary: editContent.slice(0, 100) + (editContent.length > 100 ? '...' : '')
    });
    setEditing(false);
  };

  const addSubject = () => {
    if (newSubject.trim() && !report.subjects.includes(newSubject.trim())) {
      onUpdate(report.tempId, { subjects: [...report.subjects, newSubject.trim()] });
      setNewSubject('');
    }
  };

  const removeSubject = (s: string) => {
    onUpdate(report.tempId, { subjects: report.subjects.filter(x => x !== s) });
  };

  const isDraft = report.content.includes('[待补全文稿]');

  return (
    <div
      className="border rounded-sm animate-fade-in transition-colors"
      style={{
        animationDelay: `${index * 60}ms`,
        borderColor: isDraft ? '#f59e0b' : config.color + '40',
        backgroundColor: isDraft ? '#fffbeb' : undefined
      }}
    >
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center bg-gray-50 text-gray-500">
              {report.source === 'url' ? <Link className="w-3.5 h-3.5" /> : report.source === 'file' ? <FileText className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-snug text-gray-900 mb-1">{report.title}</h4>
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span className="font-medium text-navy-700">{report.mediaName}</span>
                  <span>· {report.source === 'url' ? '链接导入' : report.source === 'file' ? '剪报上传' : '批量录入'}</span>
                  {report.url && (
                    <span className="text-navy-600 truncate max-w-[150px]" title={report.url}>
                      <a href={report.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {report.url.length > 30 ? report.url.slice(0, 30) + '...' : report.url}
                      </a>
                    </span>
                  )}
                  {report.fileName && (
                    <span className="italic">📄 {report.fileName}</span>
                  )}
                  {isDraft && (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="w-3 h-3" />
                      待补正文
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm" style={{ backgroundColor: config.color + '14', color: config.color }}>
                  {config.label}
                </span>
                <button onClick={() => setEditing(!editing)} className="p-1 text-gray-400 hover:text-navy-600 rounded-sm transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-400 hover:text-gray-600 rounded-sm transition-colors">
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => onRemove(report.tempId)} className="p-1 text-gray-400 hover:text-red-500 rounded-sm transition-colors" title="取消此条">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={report.eventId || ''}
                onChange={e => onUpdate(report.tempId, { eventId: e.target.value || undefined })}
                className="text-xs px-2 py-1 border border-gray-200 rounded-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-navy-500 flex-1"
              >
                <option value="">未关联事件</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <button
                onClick={() => onNewEvent(report.tempId)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-dashed border-navy-300 text-navy-600 hover:bg-navy-50 rounded-sm transition-colors shrink-0"
              >
                <Plus className="w-3 h-3" />新建
              </button>
            </div>

            {editing && (
              <div className="mt-3 p-3 bg-white border border-gray-200 rounded-sm animate-fade-in">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">标题</label>
                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">摘要/正文</label>
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={5} className="textarea-field text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">媒体名称</label>
                      <input type="text" value={editMediaName} onChange={e => setEditMediaName(e.target.value)} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">倾向判定</label>
                      <div className="flex flex-wrap gap-1">
                        {sentimentOptions.map(opt => (
                          <button
                            key={opt}
                            onClick={() => onUpdate(report.tempId, { sentiment: opt })}
                            className={`px-2 py-0.5 text-xs rounded-sm border transition-colors ${report.sentiment === opt ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                            style={report.sentiment === opt ? { backgroundColor: SENTIMENT_CONFIG[opt].color } : {}}
                          >
                            {SENTIMENT_CONFIG[opt].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">涉事主体</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {report.subjects.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-navy-50 text-navy-700 border border-navy-200 rounded-sm">
                          {s}
                          <button onClick={() => removeSubject(s)} className="text-navy-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={newSubject}
                        onChange={e => setNewSubject(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSubject()}
                        placeholder="添加主体..."
                        className="w-24 px-1.5 py-0.5 text-xs border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-navy-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(false)} className="btn-ghost text-xs py-1 px-3">取消</button>
                    <button onClick={handleSaveEdit} className="btn-primary text-xs py-1 px-3"><Save className="w-3 h-3 mr-1" />保存</button>
                  </div>
                </div>
              </div>
            )}

            {expanded && !editing && (
              <div className="mt-2 animate-fade-in">
                {report.recognizedText && (
                  <div className="mb-2 p-2 bg-emerald-50 border border-emerald-100 rounded-sm">
                    <p className="text-xs font-medium text-emerald-700 mb-1">识别文本片段：</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{report.recognizedText.slice(0, 300)}{report.recognizedText.length > 300 ? '...' : ''}</p>
                  </div>
                )}
                {report.keySentences.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-yellow-500" />
                      关键句（{report.keySentences.length}条）
                    </p>
                    <div className="space-y-1">
                      {report.keySentences.map((ks, i) => (
                        <div key={ks.id} className="text-xs">
                          <span className="font-mono text-gray-400">{i + 1}.</span>
                          <span className="highlight-text">{ks.text}</span>
                          <span className="text-gray-400 ml-1">— {ks.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {report.subjects.map(s => (
                      <span key={s} className="px-1.5 py-0.5 text-xs bg-navy-50 text-navy-700 border border-navy-200 rounded-sm">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<ImportTab>('url');
  const [urlInput, setUrlInput] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<SentimentType | 'all'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<{ url: string; reportId: string; title: string }[]>([]);
  const [importAreaWarnings, setImportAreaWarnings] = useState<{ url: string; reportId: string; title: string }[]>([]);
  const [fileAnalyzeProgress, setFileAnalyzeProgress] = useState<number>(0);
  const [showNewEventDialog, setShowNewEventDialog] = useState<string | null>(null);
  const [newEventName, setNewEventName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reports = useSentimentStore(s => s.reports);
  const events = useSentimentStore(s => s.events);
  const addReport = useSentimentStore(s => s.addReport);
  const addReports = useSentimentStore(s => s.addReports);
  const findReportByUrl = useSentimentStore(s => s.findReportByUrl);
  const addEvent = useSentimentStore(s => s.addEvent);
  const addReportToEvent = useSentimentStore(s => s.addReportToEvent);
  const syncEventFromReports = useSentimentStore(s => s.syncEventFromReports);
  const setSelectedReport = useSentimentStore(s => s.setSelectedReport);

  const eventOptions = events.map(e => ({ id: e.id, name: e.name }));

  const sortedReports = [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filteredReports = filterSentiment === 'all' ? sortedReports : sortedReports.filter(r => r.sentiment === filterSentiment);

  const stats = {
    total: reports.length,
    positive: reports.filter(r => r.sentiment === 'positive').length,
    neutral: reports.filter(r => r.sentiment === 'neutral').length,
    doubtful: reports.filter(r => r.sentiment === 'doubtful').length,
    negative: reports.filter(r => r.sentiment === 'negative').length,
    risk: reports.filter(r => r.sentiment === 'risk').length,
  };

  const normalizeUrl = (url: string) => url.trim().replace(/\/+$/, '');

  const checkUrlDuplicate = (url: string): { inStore: Report | undefined; inPending: boolean } => {
    const normalized = normalizeUrl(url);
    const inStore = reports.find(r => r.url && normalizeUrl(r.url) === normalized);
    const inPending = pendingReports.some(p => p.url && normalizeUrl(p.url) === normalized);
    return { inStore, inPending };
  };

  const handleUrlImport = () => {
    if (!urlInput.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const urls = urlInput.split(/\n+/).filter(u => u.trim());
      const newPending: PendingReport[] = [];
      const warnings: { url: string; reportId: string; title: string }[] = [];
      const importWarnings: { url: string; reportId: string; title: string }[] = [];

      for (const rawUrl of urls) {
        const url = rawUrl.trim();
        const { inStore, inPending } = checkUrlDuplicate(url);
        if (inStore) {
          const w = { url, reportId: inStore.id, title: inStore.title };
          warnings.push(w);
          importWarnings.push(w);
        } else if (inPending) {
          importWarnings.push({ url, reportId: '', title: '已在待确认列表中' });
        } else {
          newPending.push(analyzeUrlReport(url));
        }
      }

      setPendingReports(prev => [...prev, ...newPending]);
      setDuplicateWarnings(warnings);
      setImportAreaWarnings(importWarnings);
      setUrlInput('');
      setIsAnalyzing(false);
    }, 800);
  };

  const handleBatchImport = () => {
    if (!batchInput.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const lines = batchInput.split(/\n+/).filter(l => l.trim());
      const newPending: PendingReport[] = lines.map(line => {
        const [title, ...rest] = line.split('|').map(s => s.trim());
        const content = rest.join('|') || title;
        const result = analyzeReport(title, content);
        return {
          tempId: result.title + Date.now() + Math.random(),
          ...result,
          content: result.content || title,
        };
      });
      setPendingReports(prev => [...prev, ...newPending]);
      setBatchInput('');
      setIsAnalyzing(false);
    }, 600);
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setFileAnalyzeProgress(0);

    const results: FileImportResult[] = [];
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      try {
        const result = await analyzeFile(fileArray[i]);
        results.push(result);
      } catch (err) {
        console.error('File analysis failed:', err);
      }
      setFileAnalyzeProgress(Math.round(((i + 1) / fileArray.length) * 100));
    }

    setPendingReports(prev => [...prev, ...results.map(r => r.report)]);
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updatePendingReport = (tempId: string, updates: Partial<PendingReport>) => {
    setPendingReports(prev => prev.map(r => r.tempId === tempId ? { ...r, ...updates } : r));
  };

  const removePendingReport = (tempId: string) => {
    setPendingReports(prev => prev.filter(r => r.tempId !== tempId));
  };

  const handleNewEventForPending = (tempId: string) => {
    setShowNewEventDialog(tempId);
    setNewEventName('');
  };

  const confirmNewEvent = () => {
    if (!showNewEventDialog || !newEventName.trim()) return;
    const eventId = addEvent(newEventName.trim());
    updatePendingReport(showNewEventDialog, { eventId });
    setShowNewEventDialog(null);
    setNewEventName('');
  };

  const confirmPendingReports = () => {
    if (pendingReports.length === 0) return;

    const reportsWithEvent = pendingReports.map(({ tempId, fileName, fileSize, recognizedText, ...rest }) => rest);
    addReports(reportsWithEvent);

    const affectedEventIds = new Set<string>();
    const state = useSentimentStore.getState();
    const allReports = state.reports;

    setTimeout(() => {
      const latestReports = useSentimentStore.getState().reports;
      const newlyAdded = latestReports.slice(-pendingReports.length);

      pendingReports.forEach((pending, i) => {
        if (pending.eventId && newlyAdded[i]) {
          addReportToEvent(pending.eventId, newlyAdded[i].id);
          affectedEventIds.add(pending.eventId);
        }
      });

      affectedEventIds.forEach(eventId => {
        syncEventFromReports(eventId);
      });
    }, 50);

    setPendingReports([]);
    setDuplicateWarnings([]);
    setImportAreaWarnings([]);
  };

  const clearPendingReports = () => {
    setPendingReports([]);
    setDuplicateWarnings([]);
    setImportAreaWarnings([]);
  };

  const scrollToReport = (reportId: string) => {
    setSelectedReport(reportId);
    const el = document.getElementById(`report-${reportId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('animate-pulse-border');
      setTimeout(() => el.classList.remove('animate-pulse-border'), 3000);
    }
  };

  const filterOptions: { key: SentimentType | 'all'; label: string; icon?: typeof Filter }[] = [
    { key: 'all', label: '全部' },
    { key: 'risk', label: '风险提示', icon: ShieldAlert },
    { key: 'negative', label: '负面', icon: AlertTriangle },
    { key: 'doubtful', label: '质疑', icon: HelpCircle },
    { key: 'neutral', label: '中性', icon: Filter },
    { key: 'positive', label: '正面', icon: CheckCircle2 },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">报道导入</h1>
          <p className="text-sm text-gray-500 mt-1">导入媒体报道，系统自动完成倾向初判与关键句标注</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">已入库 {stats.total} 篇</span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { label: '正面', value: stats.positive, type: 'positive' as SentimentType, icon: TrendingUp },
          { label: '中性', value: stats.neutral, type: 'neutral' as SentimentType, icon: Filter },
          { label: '质疑', value: stats.doubtful, type: 'doubtful' as SentimentType, icon: HelpCircle },
          { label: '负面', value: stats.negative, type: 'negative' as SentimentType, icon: AlertTriangle },
          { label: '风险提示', value: stats.risk, type: 'risk' as SentimentType, icon: ShieldAlert },
          { label: '待修正', value: reports.filter(r => r.sentiment === r.originalSentiment && r.subjects.length === 0).length, type: 'neutral' as SentimentType, icon: Sparkles, highlight: true },
        ].map((item, idx) => {
          const config = SENTIMENT_CONFIG[item.type];
          const Icon = item.icon;
          return (
            <div key={idx} className={`card p-3 ${item.highlight ? 'border-amber-300 bg-amber-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">{item.label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: config.color }} strokeWidth={1.8} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold" style={{ color: config.color }}>{item.value}</span>
                <span className="text-xs text-gray-400">篇</span>
              </div>
            </div>
          );
        })}
      </div>

      {pendingReports.length > 0 && (
        <div className="mb-6 card p-5 border-2 border-navy-200 bg-navy-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-navy-700" strokeWidth={1.8} />
              <h2 className="text-sm font-semibold text-navy-800">导入复核区</h2>
              <span className="text-xs text-navy-600 bg-navy-100 px-2 py-0.5 rounded-sm font-mono">{pendingReports.length} 条待确认</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearPendingReports} className="btn-ghost text-xs py-1 px-3">
                全部取消
              </button>
              <button onClick={confirmPendingReports} className="btn-primary">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                确认入库 ({pendingReports.length})
              </button>
            </div>
          </div>

          {duplicateWarnings.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-sm">
              <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                以下链接已存在报道，已自动跳过重复导入：
              </p>
              <div className="space-y-1">
                {duplicateWarnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-amber-700 font-medium">{w.title}</span>
                    <span className="text-gray-400 truncate max-w-[200px]">{w.url}</span>
                    {w.reportId && (
                      <button onClick={() => scrollToReport(w.reportId)} className="text-navy-600 hover:underline shrink-0">
                        定位到原记录 →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {pendingReports.map((report, idx) => (
              <PendingReportCard
                key={report.tempId}
                report={report}
                index={idx}
                onUpdate={updatePendingReport}
                onRemove={removePendingReport}
                events={eventOptions}
                onNewEvent={handleNewEventForPending}
              />
            ))}
          </div>
        </div>
      )}

      {showNewEventDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowNewEventDialog(null)}>
          <div className="bg-white rounded-lg p-5 w-96 shadow-xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">新建事件</h3>
            <input
              type="text"
              value={newEventName}
              onChange={e => setNewEventName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmNewEvent()}
              placeholder="输入事件名称..."
              className="input-field text-sm mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewEventDialog(null)} className="btn-ghost text-xs py-1 px-3">取消</button>
              <button onClick={confirmNewEvent} disabled={!newEventName.trim()} className="btn-primary text-xs py-1 px-3 disabled:opacity-50">
                <Plus className="w-3 h-3 mr-1" />创建并关联
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5">
          <div className="card overflow-hidden">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${active ? 'text-navy-700 bg-white border-b-2 border-navy-700' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border-b border-transparent'}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="w-4 h-4" strokeWidth={1.8} />
                      {tab.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                {tabs.find(t => t.key === activeTab)?.desc}
              </p>

              {activeTab === 'url' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">新闻链接</label>
                  <textarea
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); setImportAreaWarnings([]); }}
                    placeholder="粘贴新闻URL，支持一行一条批量导入..."
                    rows={5}
                    className="textarea-field font-mono text-xs"
                  />

                  {importAreaWarnings.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-sm">
                      <p className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        重复链接检测
                      </p>
                      <div className="space-y-1">
                        {importAreaWarnings.map((w, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-amber-700">{w.reportId ? w.title : '已在待确认列表中'}</span>
                            <span className="text-gray-400 truncate max-w-[150px]">{w.url}</span>
                            {w.reportId && (
                              <button onClick={() => scrollToReport(w.reportId)} className="text-navy-600 hover:underline shrink-0">
                                查看原报道 →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {urlInput ? `已输入 ${urlInput.split(/\n+/).filter(u => u.trim()).length} 条链接` : '示例：https://finance.sina.com.cn/...'}
                    </p>
                    <button
                      onClick={handleUrlImport}
                      disabled={!urlInput.trim() || isAnalyzing}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" strokeWidth={1.8} />
                      {isAnalyzing ? '分析中...' : '智能分析导入'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'file' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-sm p-8 text-center cursor-pointer hover:border-navy-400 hover:bg-navy-50/30 transition-colors"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileUp className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">点击选择文件</p>
                    <p className="text-xs text-gray-400">支持 PDF、JPG、PNG、TXT 格式，可多选</p>
                  </div>

                  {isAnalyzing && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>OCR 识别分析中...</span>
                        <span>{fileAnalyzeProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-sm h-1.5 overflow-hidden">
                        <div className="h-full bg-navy-600 transition-all duration-300" style={{ width: `${fileAnalyzeProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'batch' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">标题与摘要</label>
                  <textarea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder={'每行一条，格式：标题|摘要内容\n示例：某公司发布新产品|该产品将于下月正式上市'}
                    rows={7}
                    className="textarea-field font-mono text-xs"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {batchInput ? `已输入 ${batchInput.split(/\n+/).filter(l => l.trim()).length} 条记录` : '标题和摘要用 | 分隔'}
                    </p>
                    <button
                      onClick={handleBatchImport}
                      disabled={!batchInput.trim() || isAnalyzing}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" strokeWidth={1.8} />
                      {isAnalyzing ? '分析中...' : '批量分析导入'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span>已入库报道</span>
              <span className="text-xs text-gray-400 font-normal">({filteredReports.length} 篇)</span>
            </h2>
            <div className="flex items-center gap-1">
              {filterOptions.map(opt => {
                const active = filterSentiment === opt.key;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setFilterSentiment(opt.key)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${active ? 'bg-navy-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {Icon && <Icon className="w-3 h-3" strokeWidth={1.8} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
            {filteredReports.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <Filter className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无匹配的报道</p>
              </div>
            ) : (
              filteredReports.map((report, idx) => (
                <div key={report.id} id={`report-${report.id}`}>
                  <ReportCard report={report} index={idx} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
