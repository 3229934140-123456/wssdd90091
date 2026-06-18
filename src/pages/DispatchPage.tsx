import { useState } from 'react';
import { AlertTriangle, Clock, MessageSquare, Users, Plus, Send, Phone, Mail, Edit3, Save, ChevronRight, Check, X, AlertOctagon, Zap, AlertCircle, FileText, XCircle } from 'lucide-react';
import { useSentimentStore } from '../store/sentimentStore';
import type { DispatchRecord, DispatchStatus, EscalationLevel } from '../../shared/types';
import { PRIORITY_CONFIG, DISPATCH_STATUS_CONFIG, ESCALATION_CONFIG, formatFullDateTime, getTimeAgo } from '../../shared/constants';
import { PriorityBadge, DispatchStatusBadge, RelationshipBadge, SentimentBadge } from '../components/Badges';
import { useNavigate } from 'react-router-dom';

const statusFlow: DispatchStatus[] = ['pending', 'responding', 'responded', 'closed'];
const escalationLevels: EscalationLevel[] = ['normal', 'manager', 'director', 'executive'];

interface QuadrantItem {
  id: string;
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  urgent: boolean;
  important: boolean;
  reportCount: number;
  dispatchId?: string;
  status?: DispatchStatus;
}

export default function DispatchPage() {
  const events = useSentimentStore(s => s.events);
  const dispatches = useSentimentStore(s => s.dispatches);
  const contacts = useSentimentStore(s => s.contacts);
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

  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string>(events.find(e => e.priority === 'critical')?.id || events[0]?.id);
  const [noteInput, setNoteInput] = useState('');
  const [editingStatement, setEditingStatement] = useState(false);
  const [statementDraft, setStatementDraft] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedDispatch = selectedEvent ? getDispatchByEvent(selectedEvent.id) : undefined;
  const eventReports = selectedEvent ? getReportsByEvent(selectedEvent.id) : [];

  const quadrantItems: QuadrantItem[] = events.map(e => {
    const d = getDispatchByEvent(e.id);
    const urgent = e.priority === 'critical' || e.priority === 'high';
    const important = e.sentimentShift || e.priority === 'critical';
    return {
      id: e.id,
      name: e.name,
      priority: e.priority,
      urgent,
      important,
      reportCount: getReportsByEvent(e.id).length,
      dispatchId: d?.id,
      status: d?.status
    };
  });

  const q1 = quadrantItems.filter(i => i.urgent && i.important);
  const q2 = quadrantItems.filter(i => !i.urgent && i.important);
  const q3 = quadrantItems.filter(i => i.urgent && !i.important);
  const q4 = quadrantItems.filter(i => !i.urgent && !i.important);

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
    return { ...newDispatch, id: 'temp', createdAt: '', updatedAt: '', followUpNotes: [] };
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

  const linkedContacts = selectedDispatch?.contacts.map(id => getContactById(id)).filter(Boolean) || [];
  const unboundContacts = contacts.filter(c => !isContactBound(c.id));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">处置记录</h1>
          <p className="text-sm text-gray-500 mt-1">晨会快速研判、回应口径管理、全流程状态跟踪</p>
        </div>
        <div className="flex items-center gap-3">
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
                        q.items.map(item => (
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
                              {item.status && <span>· {DISPATCH_STATUS_CONFIG[item.status].label}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" strokeWidth={1.8} />
              媒体联系人
              {selectedDispatch && selectedDispatch.contacts.length > 0 && (
                <span className="ml-auto inline-flex items-center px-2 py-0.5 text-xs font-medium bg-navy-100 text-navy-700 rounded-sm">
                  已绑定 {selectedDispatch.contacts.length}
                </span>
              )}
            </h2>
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
                          if (bound) {
                            handleUnbindContact(c.id);
                          } else {
                            handleBindContact(c.id);
                          }
                        }}
                        className={`p-1.5 rounded-sm transition-colors ${bound ? 'text-red-500 hover:bg-red-100' : 'text-emerald-500 hover:bg-emerald-100'}`}
                        title={bound ? '解绑' : '绑定到此事件'}
                      >
                        {bound ? <XCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <a href={`tel:${c.phone}`} className="p-1.5 text-gray-400 hover:text-navy-600 hover:bg-gray-100 rounded-sm transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a href={`mailto:${c.email}`} className="p-1.5 text-gray-400 hover:text-navy-600 hover:bg-gray-100 rounded-sm transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full btn-secondary text-xs py-1.5">
              <Plus className="w-3.5 h-3.5 mr-1" />
              添加联系人
            </button>
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
                  <button
                    onClick={() => navigate('/analysis')}
                    className="btn-ghost text-xs"
                  >
                    查看时间线
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {linkedContacts.length > 0 && (
                  <div className="mb-5 p-3 bg-emerald-50 border border-emerald-100 rounded-sm">
                    <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      本次处置需联络的联系人 ({linkedContacts.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {linkedContacts.map(c => c && (
                        <div key={c.id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-emerald-200 rounded-sm">
                          <span className="w-5 h-5 bg-emerald-500 text-white text-xs rounded-sm flex items-center justify-center font-medium">{c.name[0]}</span>
                          <span className="text-xs font-medium text-gray-700">{c.name}</span>
                          <span className="text-[10px] text-gray-400">· {c.media}</span>
                          <button
                            onClick={() => handleUnbindContact(c.id)}
                            className="ml-0.5 p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="移除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {unboundContacts.length > 0 && (
                  <div className="mb-5">
                    <label className="block text-xs font-medium text-gray-600 mb-2">快速绑定联系人</label>
                    <div className="flex flex-wrap gap-1.5">
                      {unboundContacts.slice(0, 6).map(c => (
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
                        <X className="w-3.5 h-3.5 mr-1" />
                        取消
                      </button>
                      <button onClick={handleSaveStatement} className="btn-primary text-xs py-1 px-3">
                        <Save className="w-3.5 h-3.5 mr-1" />
                        保存
                      </button>
                    </div>
                  )}
                </div>
                {editingStatement ? (
                  <textarea
                    value={statementDraft}
                    onChange={(e) => setStatementDraft(e.target.value)}
                    rows={5}
                    placeholder="在此起草官方回应口径...建议包含：事实陈述、公司态度、整改措施、联系方式"
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
                      <Check className="w-3 h-3" />
                      口径已确认
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
                        <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-xs font-medium shrink-0">
                          王
                        </div>
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
    </div>
  );
}
