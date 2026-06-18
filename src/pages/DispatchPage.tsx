import { useState } from 'react';
import { AlertTriangle, Clock, MessageSquare, Users, Plus, Send, Phone, Mail, Edit3, Save, ChevronRight, Check, X, AlertOctagon, Zap, AlertCircle, FileText, XCircle, Target, UserPlus, ClipboardList, Filter } from 'lucide-react';
import { useSentimentStore } from '../store/sentimentStore';
import type { DispatchRecord, DispatchStatus, EscalationLevel, ContactCommStatus, RelationshipLevel, EventPriority } from '../../shared/types';
import { PRIORITY_CONFIG, DISPATCH_STATUS_CONFIG, ESCALATION_CONFIG, COMM_STATUS_CONFIG, RELATIONSHIP_CONFIG, formatFullDateTime, getTimeAgo } from '../../shared/constants';
import { PriorityBadge, DispatchStatusBadge, RelationshipBadge, SentimentBadge } from '../components/Badges';
import { useNavigate } from 'react-router-dom';

const statusFlow: DispatchStatus[] = ['pending', 'responding', 'responded', 'closed'];
const escalationLevels: EscalationLevel[] = ['normal', 'manager', 'director', 'executive'];
const commStatusOptions: ContactCommStatus[] = ['pending', 'contacted', 'responded', 'declined'];
const relationshipOptions: RelationshipLevel[] = ['friendly', 'neutral', 'difficult'];

type ViewMode = 'board' | 'minutes';
type MinutesFilter = 'all' | 'pending' | 'contacted' | 'escalation';

interface QuadrantItem {
  id: string;
  name: string;
  priority: EventPriority;
  urgent: boolean;
  important: boolean;
  reportCount: number;
  dispatchId?: string;
  status?: DispatchStatus;
  escalationReasons?: string[];
  negativeRiskCount?: number;
}

interface MinutesItem {
  eventId: string;
  eventName: string;
  priority: EventPriority;
  escalationReasons: string[];
  negativeRiskCount: number;
  reportCount: number;
  interviewTargets: { name: string; media: string; commStatus: ContactCommStatus }[];
  allContacts: { name: string; media: string; commStatus: ContactCommStatus; isTarget: boolean }[];
  nextAction: string;
  dispatchStatus?: DispatchStatus;
  needsEscalation: boolean;
  needsStatement: boolean;
  needsInterview: boolean;
}

export default function DispatchPage() {
  const events = useSentimentStore(s => s.events);
  const dispatches = useSentimentStore(s => s.dispatches);
  const contacts = useSentimentStore(s => s.contacts);
  const reports = useSentimentStore(s => s.reports);
  const getReportsByEvent = useSentimentStore(s => s.getReportsByEvent);
  const getDispatchByEvent = useSentimentStore(s => s.getDispatchByEvent);
  const getContactById = useSentimentStore(s => s.getContactById);
  const addDispatch = useSentimentStore(s => s.addDispatch);
  const updateDispatch = useSentimentStore(s => s.updateDispatch);
  const updateDispatchStatus = useSentimentStore(s => s.updateDispatchStatus);
  const updateDispatchStatement = useSentimentStore(s => s.updateDispatchStatement);
  const addFollowUpNote = useSentimentStore(s => s.addFollowUpNote);
  const updateDispatchEscalation = useSentimentStore(s => s.updateDispatchEscalation);
  const bindContactToDispatch = useSentimentStore(s => s.bindContactToDispatch);
  const unbindContactFromDispatch = useSentimentStore(s => s.unbindContactFromDispatch);
  const setInterviewTarget = useSentimentStore(s => s.setInterviewTarget);
  const setContactCommStatus = useSentimentStore(s => s.setContactCommStatus);
  const setContactNote = useSentimentStore(s => s.setContactNote);
  const addContact = useSentimentStore(s => s.addContact);
  const syncEventFromReports = useSentimentStore(s => s.syncEventFromReports);

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [minutesFilter, setMinutesFilter] = useState<MinutesFilter>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>(events.find(e => e.priority === 'critical')?.id || events[0]?.id);
  const [noteInput, setNoteInput] = useState('');
  const [editingStatement, setEditingStatement] = useState(false);
  const [statementDraft, setStatementDraft] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactMedia, setNewContactMedia] = useState('');
  const [newContactTitle, setNewContactTitle] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState<RelationshipLevel>('neutral');

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedDispatch = selectedEvent ? getDispatchByEvent(selectedEvent.id) : undefined;
  const eventReports = selectedEvent ? getReportsByEvent(selectedEvent.id) : [];

  const quadrantItems: QuadrantItem[] = events.map(e => {
    const d = getDispatchByEvent(e.id);
    const evReports = getReportsByEvent(e.id);
    const urgent = e.priority === 'critical' || e.priority === 'high';
    const important = e.sentimentShift || e.priority === 'critical';
    return {
      id: e.id,
      name: e.name,
      priority: e.priority,
      urgent,
      important,
      reportCount: evReports.length,
      dispatchId: d?.id,
      status: d?.status,
      escalationReasons: e.escalationReasons || [],
      negativeRiskCount: evReports.filter(r => r.sentiment === 'negative' || r.sentiment === 'risk').length
    };
  });

  const q1 = quadrantItems.filter(i => i.urgent && i.important);
  const q2 = quadrantItems.filter(i => !i.urgent && i.important);
  const q3 = quadrantItems.filter(i => i.urgent && !i.important);
  const q4 = quadrantItems.filter(i => !i.urgent && !i.important);

  const minutesItems: MinutesItem[] = events
    .filter(e => e.priority === 'critical' || e.priority === 'high')
    .map(e => {
      const d = getDispatchByEvent(e.id);
      const evReports = getReportsByEvent(e.id);
      const linkedContacts = (d?.interviewContacts || [])
        .map(ic => {
          const c = getContactById(ic.contactId);
          if (!c) return null;
          return { name: c.name, media: c.media, commStatus: ic.commStatus, isTarget: ic.isInterviewTarget };
        })
        .filter(Boolean) as { name: string; media: string; commStatus: ContactCommStatus; isTarget: boolean }[];

      const targets = linkedContacts.filter(c => c.isTarget);
      const negRiskCount = evReports.filter(r => r.sentiment === 'negative' || r.sentiment === 'risk').length;

      let nextAction = '持续观察';
      if (d) {
        if (d.needEscalation) nextAction = '升级管理层审批';
        else if (d.needStatement && !d.statement) nextAction = '起草官方声明';
        else if (d.needInterview && targets.some(t => t.commStatus === 'pending')) nextAction = '联系约访目标';
        else if (d.status === 'pending') nextAction = '启动响应流程';
        else if (d.status === 'responding') nextAction = '跟进回应进展';
      } else {
        if (negRiskCount >= 2) nextAction = '创建处置记录';
        else nextAction = '关注舆情发展';
      }

      return {
        eventId: e.id,
        eventName: e.name,
        priority: e.priority,
        escalationReasons: e.escalationReasons || [],
        negativeRiskCount: negRiskCount,
        reportCount: evReports.length,
        interviewTargets: targets,
        allContacts: linkedContacts,
        nextAction,
        dispatchStatus: d?.status,
        needsEscalation: d?.needEscalation || false,
        needsStatement: d?.needStatement || false,
        needsInterview: d?.needInterview || false,
      };
    });

  const filteredMinutes = minutesItems.filter(item => {
    if (minutesFilter === 'all') return true;
    if (minutesFilter === 'pending') return item.allContacts.some(c => c.commStatus === 'pending');
    if (minutesFilter === 'contacted') return item.allContacts.some(c => c.commStatus === 'contacted');
    if (minutesFilter === 'escalation') return item.needsEscalation;
    return true;
  });

  const ensureDispatch = (): DispatchRecord => {
    if (selectedDispatch) return selectedDispatch;
    const newDispatch = {
      eventId: selectedEventId,
      status: 'pending' as DispatchStatus,
      statement: '',
      contacts: [],
      escalationLevel: 'normal' as EscalationLevel,
      needStatement: false,
      needInterview: false,
      needEscalation: false
    };
    addDispatch(newDispatch);
    return { ...newDispatch, id: 'temp', createdAt: '', updatedAt: '', followUpNotes: [], interviewContacts: [] };
  };

  const handleAddNote = () => {
    if (!noteInput.trim() || !selectedDispatch) return;
    addFollowUpNote(selectedDispatch.id, noteInput.trim());
    setNoteInput('');
  };

  const handleSaveStatement = () => {
    if (!selectedDispatch) return;
    updateDispatchStatement(selectedDispatch.id, statementDraft);
    setEditingStatement(false);
  };

  const handleToggleNeed = (field: 'needStatement' | 'needInterview' | 'needEscalation') => {
    const d = ensureDispatch();
    updateDispatch(d.id, { [field]: !(d as any)[field] } as Partial<DispatchRecord>);
  };

  const handleStatusChange = (status: DispatchStatus) => {
    const d = ensureDispatch();
    updateDispatchStatus(d.id, status);
  };

  const handleEscalationChange = (level: EscalationLevel) => {
    const d = ensureDispatch();
    updateDispatchEscalation(d.id, level);
  };

  const handleBindContact = (contactId: string) => {
    const d = ensureDispatch();
    bindContactToDispatch(d.id, contactId);
  };

  const handleUnbindContact = (contactId: string) => {
    if (!selectedDispatch) return;
    unbindContactFromDispatch(selectedDispatch.id, contactId);
  };

  const isContactBound = (contactId: string): boolean => {
    return selectedDispatch?.contacts.includes(contactId) || false;
  };

  const handleAddNewContact = () => {
    if (!newContactName.trim() || !newContactMedia.trim()) return;
    addContact({
      name: newContactName.trim(),
      media: newContactMedia.trim(),
      title: newContactTitle.trim() || '记者',
      phone: newContactPhone.trim() || '-',
      email: newContactEmail.trim() || '-',
      relationship: newContactRelationship,
    });
    if (selectedDispatch) {
      const latestContact = useSentimentStore.getState().contacts[useSentimentStore.getState().contacts.length - 1];
      if (latestContact) {
        bindContactToDispatch(selectedDispatch.id, latestContact.id);
      }
    }
    setNewContactName('');
    setNewContactMedia('');
    setNewContactTitle('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewContactRelationship('neutral');
    setShowAddContact(false);
  };

  const handleSyncEvent = () => {
    if (selectedEventId) {
      syncEventFromReports(selectedEventId);
    }
  };

  const linkedContacts = selectedDispatch?.interviewContacts
    .map(ic => ({ ...ic, contact: getContactById(ic.contactId) }))
    .filter(ic => ic.contact) || [];

  const interviewTargets = linkedContacts.filter(ic => ic.isInterviewTarget);
  const unboundContacts = contacts.filter(c => !isContactBound(c.id));

  const renderQuadrantItem = (item: QuadrantItem) => (
    <div
      key={item.id}
      onClick={() => setSelectedEventId(item.id)}
      className={`text-xs p-2 rounded-sm cursor-pointer transition-colors ${selectedEventId === item.id ? 'bg-white shadow-sm border border-navy-300' : 'bg-white/60 hover:bg-white'}`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-1.5 h-1.5 rounded-full ${item.priority === 'critical' ? 'bg-red-500 animate-pulse' : item.priority === 'high' ? 'bg-amber-500' : item.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-400'}`} />
        <span className="truncate flex-1 font-medium text-gray-700">{item.name}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-gray-500">
        <span>{item.reportCount}篇</span>
        {(item.negativeRiskCount || 0) > 0 && <span className="text-red-500">· {item.negativeRiskCount}条负面/风险</span>}
        {item.status && <span>· {DISPATCH_STATUS_CONFIG[item.status].label}</span>}
      </div>
      {item.escalationReasons.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {item.escalationReasons.slice(0, 2).map((r, i) => (
            <span key={i} className="px-1 py-0.5 text-[9px] bg-red-50 text-red-600 border border-red-100 rounded-sm">{r}</span>
          ))}
        </div>
      )}
    </div>
  );

  const renderMinutes = () => (
    <div className="space-y-4">
      {filteredMinutes.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">当前筛选条件下无高优先级事件</p>
        </div>
      ) : (
        filteredMinutes.map(item => (
          <div key={item.eventId} className="card overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => { setSelectedEventId(item.eventId); setViewMode('board'); }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  <h3 className="font-serif font-bold text-sm text-gray-900">{item.eventName}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                  <span>{item.reportCount}篇报道</span>
                  {item.negativeRiskCount > 0 && <span className="text-red-500 font-medium">{item.negativeRiskCount}条负面/风险</span>}
                  {item.dispatchStatus && (
                    <span className={`px-1.5 py-0.5 rounded-sm text-[10px] ${DISPATCH_STATUS_CONFIG[item.dispatchStatus].color} bg-gray-100 border border-gray-200`}>
                      {DISPATCH_STATUS_CONFIG[item.dispatchStatus].label}
                    </span>
                  )}
                </div>
              </div>

              {item.escalationReasons.length > 0 && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-100 rounded-sm">
                  <p className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" />
                    升级原因
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.escalationReasons.map((r, i) => (
                      <span key={i} className="px-1.5 py-0.5 text-xs bg-white text-red-600 border border-red-200 rounded-sm">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {item.allContacts.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3 h-3" />
                    约访清单
                    {item.interviewTargets.length > 0 && (
                      <span className="text-amber-600 font-normal">({item.interviewTargets.length}人待约访)</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.allContacts.map((c, i) => {
                      const commConfig = COMM_STATUS_CONFIG[c.commStatus];
                      return (
                        <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-sm border ${c.isTarget ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                          <span className="font-medium text-gray-700">{c.name}</span>
                          <span className="text-gray-400">{c.media}</span>
                          {c.isTarget && <Target className="w-2.5 h-2.5 text-amber-500" />}
                          <span className={`px-1 py-0.5 rounded-sm text-[10px] ${commConfig.color} ${commConfig.bgColor}`}>{commConfig.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.needsEscalation && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded-sm">
                      <AlertOctagon className="w-2.5 h-2.5" />需升级
                    </span>
                  )}
                  {item.needsStatement && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-sm">
                      <MessageSquare className="w-2.5 h-2.5" />需声明
                    </span>
                  )}
                  {item.needsInterview && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-sm">
                      <Phone className="w-2.5 h-2.5" />需约访
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="font-medium text-gray-700">下一步：</span>
                  <span className="text-navy-700">{item.nextAction}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">处置记录</h1>
          <p className="text-sm text-gray-500 mt-1">晨会快速研判、约访清单、回应口径管理、全流程状态跟踪</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-sm p-0.5">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${viewMode === 'board' ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                研判看板
              </div>
            </button>
            <button
              onClick={() => setViewMode('minutes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${viewMode === 'minutes' ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" />
                晨会纪要
              </div>
            </button>
          </div>
          <button onClick={handleSyncEvent} className="btn-ghost text-xs">
            <Zap className="w-3.5 h-3.5 mr-1" />
            同步优先级
          </button>
          <div className="text-right">
            <p className="text-xs text-gray-500">今日待处置</p>
            <p className="text-xl font-mono font-bold text-red-600">{dispatches.filter(d => d.status === 'pending' || d.status === 'responding').length}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-right">
            <p className="text-xs text-gray-500">已闭环</p>
            <p className="text-xl font-mono font-bold text-emerald-600">{dispatches.filter(d => d.status === 'closed').length}</p>
          </div>
        </div>
      </div>

      {viewMode === 'minutes' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-navy-700" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold text-gray-800">晨会纪要 · 高优先级事件汇总</h2>
            <span className="text-xs text-gray-500 font-mono">{filteredMinutes.length} 个事件</span>
            <div className="ml-auto flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              {([
                { key: 'all' as MinutesFilter, label: '全部' },
                { key: 'pending' as MinutesFilter, label: '待联系' },
                { key: 'contacted' as MinutesFilter, label: '已联系' },
                { key: 'escalation' as MinutesFilter, label: '需升级' },
              ]).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setMinutesFilter(opt.key)}
                  className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${minutesFilter === opt.key ? 'bg-navy-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {renderMinutes()}
        </div>
      )}

      {viewMode === 'board' && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5">
            <div className="card p-5 mb-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
                晨会研判看板 · 紧急/重要矩阵
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Q1 紧急且重要', items: q1, color: 'red', icon: Zap },
                  { title: 'Q2 重要不紧急', items: q2, color: 'amber', icon: Clock },
                  { title: 'Q3 紧急不重要', items: q3, color: 'blue', icon: MessageSquare },
                  { title: 'Q4 常规观察', items: q4, color: 'gray', icon: FileText },
                ].map(q => {
                  const Icon = q.icon;
                  return (
                    <div key={q.title} className={`border rounded-sm p-3 min-h-[140px] bg-${q.color}-50/50 border-${q.color}-100`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className={`w-3.5 h-3.5 text-${q.color}-600`} strokeWidth={1.8} />
                        <p className={`text-xs font-semibold text-${q.color}-700`}>{q.title}</p>
                        <span className="ml-auto text-xs text-gray-400 font-mono">{q.items.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {q.items.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">暂无</p>
                        ) : (
                          q.items.map(item => renderQuadrantItem(item))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" strokeWidth={1.8} />
                  媒体联系人
                  {selectedDispatch && selectedDispatch.interviewContacts.length > 0 && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 text-xs font-medium bg-navy-100 text-navy-700 rounded-sm">
                      已绑定 {selectedDispatch.interviewContacts.length}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="p-1 text-gray-400 hover:text-navy-600 rounded-sm transition-colors"
                  title="新增联系人"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>

              {showAddContact && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-sm animate-fade-in">
                  <p className="text-xs font-medium text-gray-600 mb-2">新增联系人</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder="姓名 *" className="input-field text-xs py-1" />
                    <input type="text" value={newContactMedia} onChange={e => setNewContactMedia(e.target.value)} placeholder="媒体 *" className="input-field text-xs py-1" />
                    <input type="text" value={newContactTitle} onChange={e => setNewContactTitle(e.target.value)} placeholder="职位" className="input-field text-xs py-1" />
                    <input type="text" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} placeholder="电话" className="input-field text-xs py-1" />
                    <input type="text" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} placeholder="邮箱" className="input-field text-xs py-1" />
                    <select value={newContactRelationship} onChange={e => setNewContactRelationship(e.target.value as RelationshipLevel)} className="select-field text-xs py-1">
                      {relationshipOptions.map(opt => (
                        <option key={opt} value={opt}>{RELATIONSHIP_CONFIG[opt].label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddContact(false)} className="btn-ghost text-xs py-1 px-2">取消</button>
                    <button onClick={handleAddNewContact} disabled={!newContactName.trim() || !newContactMedia.trim()} className="btn-primary text-xs py-1 px-2 disabled:opacity-50">
                      <Check className="w-3 h-3 mr-1" />添加并绑定
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                {contacts.map(c => {
                  const bound = isContactBound(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center gap-3 p-2.5 rounded-sm transition-colors ${bound ? 'bg-navy-50 border border-navy-200' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`w-9 h-9 rounded-sm flex items-center justify-center font-medium text-sm shrink-0 ${bound ? 'bg-navy-600 text-white' : 'bg-navy-50 text-navy-700'}`}>
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{c.name}</span>
                          <RelationshipBadge relationship={c.relationship} />
                        </div>
                        <p className="text-xs text-gray-500 truncate">{c.media} · {c.title}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (bound) handleUnbindContact(c.id);
                            else handleBindContact(c.id);
                          }}
                          className={`p-1.5 rounded-sm transition-colors ${bound ? 'text-red-500 hover:bg-red-100' : 'text-emerald-500 hover:bg-emerald-100'}`}
                          title={bound ? '解绑' : '绑定到此事件'}
                        >
                          {bound ? <XCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <a href={`tel:${c.phone}`} className="p-1.5 text-gray-400 hover:text-navy-600 hover:bg-gray-100 rounded-sm transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-7">
            {selectedEvent && (
              <>
                <div className="card p-5 mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <PriorityBadge priority={selectedEvent.priority} />
                        <h2 className="font-serif font-bold text-base text-gray-900">{selectedEvent.name}</h2>
                      </div>
                      {selectedEvent.description && (
                        <p className="text-xs text-gray-500">{selectedEvent.description}</p>
                      )}
                    </div>
                    <button onClick={() => navigate('/analysis')} className="btn-ghost text-xs">
                      查看时间线 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(selectedEvent.escalationReasons?.length || 0) > 0 && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-sm">
                      <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        升级原因（为什么需要升级处理）
                      </p>
                      <div className="space-y-1">
                        {selectedEvent.escalationReasons?.map((reason, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {linkedContacts.length > 0 && (
                    <div className="mb-5 p-3 bg-emerald-50 border border-emerald-100 rounded-sm">
                      <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        晨会约访清单 ({linkedContacts.length}人)
                        {interviewTargets.length > 0 && (
                          <span className="text-amber-600 font-normal ml-2">· {interviewTargets.length}人标记为约访目标</span>
                        )}
                      </p>
                      <div className="space-y-2">
                        {linkedContacts.map(ic => {
                          const c = ic.contact!;
                          const commConfig = COMM_STATUS_CONFIG[ic.commStatus];
                          return (
                            <div key={ic.contactId} className="flex items-center gap-2 p-2 bg-white border border-emerald-200 rounded-sm">
                              <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-medium shrink-0 ${ic.isInterviewTarget ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                {c.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-gray-700">{c.name}</span>
                                  <span className="text-[10px] text-gray-400">{c.media}</span>
                                  {ic.isInterviewTarget && (
                                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] bg-amber-100 text-amber-700 rounded-sm font-medium">
                                      <Target className="w-2.5 h-2.5" />约访目标
                                    </span>
                                  )}
                                </div>
                              </div>
                              <select
                                value={ic.commStatus}
                                onChange={e => {
                                  if (selectedDispatch) setContactCommStatus(selectedDispatch.id, ic.contactId, e.target.value as ContactCommStatus);
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${commConfig.color} ${commConfig.bgColor} border-current cursor-pointer`}
                              >
                                {commStatusOptions.map(s => (
                                  <option key={s} value={s}>{COMM_STATUS_CONFIG[s].label}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  if (selectedDispatch) setInterviewTarget(selectedDispatch.id, ic.contactId, !ic.isInterviewTarget);
                                }}
                                className={`p-1 rounded-sm transition-colors ${ic.isInterviewTarget ? 'text-amber-500 hover:bg-amber-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={ic.isInterviewTarget ? '取消约访标记' : '标记为约访目标'}
                              >
                                <Target className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUnbindContact(ic.contactId)}
                                className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                                title="移除"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {unboundContacts.length > 0 && (
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-gray-600 mb-2">快速绑定联系人</label>
                      <div className="flex flex-wrap gap-1.5">
                        {unboundContacts.slice(0, 8).map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleBindContact(c.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 text-gray-600 hover:bg-navy-50 hover:border-navy-200 hover:text-navy-700 rounded-sm transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3 mb-5">
                    {[
                      { label: '报道数', value: eventReports.length, icon: FileText },
                      { label: '负面/风险', value: eventReports.filter(r => r.sentiment === 'negative' || r.sentiment === 'risk').length, icon: AlertOctagon, color: 'text-red-600' },
                      { label: '态度转变', value: selectedEvent.sentimentShift ? '是' : '否', icon: Zap, color: selectedEvent.sentimentShift ? 'text-amber-600' : 'text-gray-500' },
                      { label: '首发时间', value: getTimeAgo(selectedEvent.firstReportTime), icon: Clock, color: 'text-gray-600' },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={idx} className="bg-gray-50 border border-gray-100 rounded-sm p-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Icon className="w-3 h-3" strokeWidth={1.8} />
                            {stat.label}
                          </div>
                          <p className={`text-lg font-mono font-semibold ${stat.color || 'text-gray-800'}`}>{stat.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">处置决策</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'needStatement', label: '需要发布声明', icon: MessageSquare },
                          { key: 'needInterview', label: '需要约访记者', icon: Phone },
                          { key: 'needEscalation', label: '需要升级管理层', icon: AlertOctagon },
                        ].map(opt => {
                          const Icon = opt.icon;
                          const active = selectedDispatch ? (selectedDispatch as any)[opt.key] : false;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleToggleNeed(opt.key as any)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border transition-colors ${active ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                              {active ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" strokeWidth={1.8} />}
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">处置状态</p>
                        <div className="flex gap-1.5">
                          {statusFlow.map(status => {
                            const active = selectedDispatch?.status === status;
                            const config = DISPATCH_STATUS_CONFIG[status];
                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-sm border transition-colors ${active ? `${config.color} border-current bg-white` : 'text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                                {config.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">升级级别</p>
                        <div className="flex gap-1.5">
                          {escalationLevels.map(level => {
                            const active = selectedDispatch?.escalationLevel === level;
                            const config = ESCALATION_CONFIG[level];
                            return (
                              <button
                                key={level}
                                onClick={() => handleEscalationChange(level)}
                                className={`flex-1 px-2 py-1.5 text-xs rounded-sm border transition-colors ${active ? `${config.color} border-current bg-white font-medium` : 'text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                              >
                                {config.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" strokeWidth={1.8} />
                      官方回应口径
                    </h3>
                    {!editingStatement ? (
                      <button
                        onClick={() => {
                          setStatementDraft(selectedDispatch?.statement || '');
                          setEditingStatement(true);
                        }}
                        className="btn-ghost text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        {selectedDispatch?.statement ? '编辑' : '起草口径'}
                      </button>
                    ) : (
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditingStatement(false)} className="btn-ghost text-xs">
                          <X className="w-3.5 h-3.5 mr-1" />取消
                        </button>
                        <button onClick={handleSaveStatement} className="btn-primary text-xs py-1 px-3">
                          <Save className="w-3.5 h-3.5 mr-1" />保存
                        </button>
                      </div>
                    )}
                  </div>
                  {editingStatement ? (
                    <textarea
                      value={statementDraft}
                      onChange={(e) => setStatementDraft(e.target.value)}
                      rows={5}
                      placeholder="在此起草官方回应口径..."
                      className="textarea-field text-sm leading-relaxed"
                    />
                  ) : (
                    <div className={`rounded-sm p-4 ${selectedDispatch?.statement ? 'bg-navy-50 border border-navy-100' : 'bg-gray-50 border border-dashed border-gray-200'}`}>
                      {selectedDispatch?.statement ? (
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedDispatch.statement}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">尚未起草回应口径</p>
                      )}
                    </div>
                  )}
                  {selectedDispatch?.statement && (
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>最后更新：{formatFullDateTime(selectedDispatch.updatedAt)}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Check className="w-3 h-3" />口径已确认
                      </span>
                    </div>
                  )}
                </div>

                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" strokeWidth={1.8} />
                      跟进记录
                      <span className="text-xs text-gray-400 font-normal">({selectedDispatch?.followUpNotes.length || 0}条)</span>
                    </h3>
                  </div>
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {!selectedDispatch?.followUpNotes.length ? (
                      <p className="text-sm text-gray-400 italic text-center py-4">暂无跟进记录</p>
                    ) : (
                      [...selectedDispatch.followUpNotes].reverse().map((note, idx) => (
                        <div key={note.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                          <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-xs font-medium shrink-0">王</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700">{note.content}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">{formatFullDateTime(note.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedDispatch && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                        placeholder="添加跟进记录..."
                        className="input-field flex-1"
                      />
                      <button onClick={handleAddNote} disabled={!noteInput.trim()} className="btn-primary disabled:opacity-50">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
