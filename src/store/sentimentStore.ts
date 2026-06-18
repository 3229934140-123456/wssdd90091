import { create } from 'zustand';
import type { Report, MediaEvent, Contact, DispatchRecord, InterviewContact, ContactCommStatus, SentimentType, MediaLevel, ReachScope, DispatchStatus, EscalationLevel, EventPriority } from '../../shared/types';
import { mockReports, mockEvents, mockContacts, mockDispatches } from '../../shared/mockData';
import { generateId } from '../../shared/constants';

const STORAGE_KEY = 'sentiment-platform-data-v2';

interface PersistedData {
  reports: Report[];
  events: MediaEvent[];
  contacts: Contact[];
  dispatches: DispatchRecord[];
  initialized: boolean;
}

function loadFromStorage(): PersistedData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as PersistedData;
    }
    const oldStored = localStorage.getItem('sentiment-platform-data-v1');
    if (oldStored) {
      const oldData = JSON.parse(oldStored);
      const migrated = migrateV1(oldData);
      localStorage.removeItem('sentiment-platform-data-v1');
      saveToStorage(migrated);
      return migrated;
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return null;
}

function migrateV1(oldData: any): PersistedData {
  const dispatches = (oldData.dispatches || []).map((d: any) => ({
    ...d,
    interviewContacts: (d.contacts || []).map((cId: string) => ({
      contactId: cId,
      isInterviewTarget: false,
      commStatus: 'pending' as ContactCommStatus,
      note: ''
    }))
  }));
  const events = (oldData.events || []).map((e: any) => ({
    ...e,
    escalationReasons: e.escalationReasons || []
  }));
  return {
    reports: oldData.reports || [],
    events,
    contacts: oldData.contacts || [],
    dispatches,
    initialized: true
  };
}

function saveToStorage(data: Omit<PersistedData, 'initialized'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, initialized: true }));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

const stored = loadFromStorage();

const defaultDispatches = mockDispatches.map(d => ({
  ...d,
  interviewContacts: d.contacts.map(cId => ({
    contactId: cId,
    isInterviewTarget: false,
    commStatus: 'pending' as ContactCommStatus,
    note: ''
  }))
}));

const defaultEvents = mockEvents.map(e => ({
  ...e,
  escalationReasons: e.escalationReasons || []
}));

interface SentimentStore {
  reports: Report[];
  events: MediaEvent[];
  contacts: Contact[];
  dispatches: DispatchRecord[];
  selectedEventId: string | null;
  selectedReportId: string | null;
  selectedDispatchId: string | null;

  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'originalSentiment'>) => void;
  addReports: (reports: Omit<Report, 'id' | 'createdAt' | 'originalSentiment'>[]) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  updateReportSentiment: (id: string, sentiment: SentimentType) => void;
  updateReportSubjects: (id: string, subjects: string[]) => void;
  updateReportMediaLevel: (id: string, mediaLevel: MediaLevel) => void;
  updateReportReachScope: (id: string, reachScope: ReachScope) => void;

  setSelectedEvent: (id: string | null) => void;
  setSelectedReport: (id: string | null) => void;
  setSelectedDispatch: (id: string | null) => void;

  addDispatch: (dispatch: Omit<DispatchRecord, 'id' | 'createdAt' | 'updatedAt' | 'followUpNotes' | 'interviewContacts'> & { followUpNotes?: string[]; interviewContacts?: InterviewContact[] }) => void;
  updateDispatch: (id: string, updates: Partial<DispatchRecord>) => void;
  updateDispatchStatus: (id: string, status: DispatchStatus) => void;
  updateDispatchStatement: (id: string, statement: string) => void;
  addFollowUpNote: (dispatchId: string, content: string) => void;
  updateDispatchEscalation: (id: string, level: EscalationLevel) => void;

  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;

  bindContactToDispatch: (dispatchId: string, contactId: string) => void;
  unbindContactFromDispatch: (dispatchId: string, contactId: string) => void;
  setInterviewTarget: (dispatchId: string, contactId: string, isTarget: boolean) => void;
  setContactCommStatus: (dispatchId: string, contactId: string, status: ContactCommStatus) => void;
  setContactNote: (dispatchId: string, contactId: string, note: string) => void;

  updateEventPriority: (eventId: string, priority: EventPriority) => void;
  addEscalationReason: (eventId: string, reason: string) => void;
  syncEventFromReports: (eventId: string) => void;
  addEvent: (name: string, description?: string) => string;
  addReportToEvent: (eventId: string, reportId: string) => void;

  findReportByUrl: (url: string) => Report | undefined;
  findPendingReportByUrl: (url: string) => boolean;

  resetToMockData: () => void;

  getReportsByEvent: (eventId: string) => Report[];
  getDispatchByEvent: (eventId: string) => DispatchRecord | undefined;
  getContactById: (id: string) => Contact | undefined;
}

const persistMiddleware = (set: any, get: any) => {
  const originalSet = set;
  return (partial: any) => {
    originalSet(partial);
    const state = get();
    saveToStorage({
      reports: state.reports,
      events: state.events,
      contacts: state.contacts,
      dispatches: state.dispatches,
    });
  };
};

export const useSentimentStore = create<SentimentStore>((set, get) => {
  const persistedSet = persistMiddleware(set, get);

  return {
    reports: stored?.reports ?? mockReports,
    events: stored?.events ?? defaultEvents,
    contacts: stored?.contacts ?? mockContacts,
    dispatches: stored?.dispatches ?? defaultDispatches,
    selectedEventId: null,
    selectedReportId: null,
    selectedDispatchId: null,

    addReport: (report) => persistedSet((state: any) => ({
      reports: [...state.reports, {
        ...report,
        id: generateId(),
        createdAt: new Date().toISOString(),
        originalSentiment: report.sentiment
      }]
    })),

    addReports: (newReports) => persistedSet((state: any) => ({
      reports: [...state.reports, ...newReports.map(r => ({
        ...r,
        id: generateId(),
        createdAt: new Date().toISOString(),
        originalSentiment: r.sentiment
      }))]
    })),

    updateReport: (id, updates) => persistedSet((state: any) => {
      const newReports = state.reports.map((r: Report) => r.id === id ? { ...r, ...updates } : r);
      const updatedReport = newReports.find((r: Report) => r.id === id);
      if (updatedReport && updatedReport.eventId) {
        setTimeout(() => get().syncEventFromReports(updatedReport.eventId!), 0);
      }
      return { reports: newReports };
    }),

    updateReportSentiment: (id, sentiment) => persistedSet((state: any) => {
      const newReports = state.reports.map((r: Report) => r.id === id ? { ...r, sentiment } : r);
      const updatedReport = newReports.find((r: Report) => r.id === id);
      if (updatedReport && updatedReport.eventId) {
        setTimeout(() => get().syncEventFromReports(updatedReport.eventId!), 0);
      }
      return { reports: newReports };
    }),

    updateReportSubjects: (id, subjects) => persistedSet((state: any) => ({
      reports: state.reports.map((r: Report) => r.id === id ? { ...r, subjects } : r)
    })),

    updateReportMediaLevel: (id, mediaLevel) => persistedSet((state: any) => ({
      reports: state.reports.map((r: Report) => r.id === id ? { ...r, mediaLevel } : r)
    })),

    updateReportReachScope: (id, reachScope) => persistedSet((state: any) => ({
      reports: state.reports.map((r: Report) => r.id === id ? { ...r, reachScope } : r)
    })),

    setSelectedEvent: (id) => set({ selectedEventId: id }),
    setSelectedReport: (id) => set({ selectedReportId: id }),
    setSelectedDispatch: (id) => set({ selectedDispatchId: id }),

    addDispatch: (dispatch) => persistedSet((state: any) => ({
      dispatches: [...state.dispatches, {
        ...dispatch,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        followUpNotes: dispatch.followUpNotes?.map((content: string, idx: number) => ({
          id: generateId(),
          content,
          createdAt: new Date(Date.now() + idx * 1000).toISOString()
        })) || [],
        interviewContacts: dispatch.interviewContacts || []
      }]
    })),

    updateDispatch: (id, updates) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)
    })),

    updateDispatchStatus: (id, status) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d)
    })),

    updateDispatchStatement: (id, statement) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => d.id === id ? { ...d, statement, updatedAt: new Date().toISOString() } : d)
    })),

    addFollowUpNote: (dispatchId, content) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => d.id === dispatchId ? {
        ...d,
        followUpNotes: [...d.followUpNotes, { id: generateId(), content, createdAt: new Date().toISOString() }],
        updatedAt: new Date().toISOString()
      } : d)
    })),

    updateDispatchEscalation: (id, level) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => d.id === id ? { ...d, escalationLevel: level, updatedAt: new Date().toISOString() } : d)
    })),

    addContact: (contact) => persistedSet((state: any) => ({
      contacts: [...state.contacts, { ...contact, id: generateId() }]
    })),

    updateContact: (id, updates) => persistedSet((state: any) => ({
      contacts: state.contacts.map((c: Contact) => c.id === id ? { ...c, ...updates } : c)
    })),

    bindContactToDispatch: (dispatchId, contactId) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => {
        if (d.id !== dispatchId) return d;
        if (d.contacts.includes(contactId)) return d;
        const newInterviewContact: InterviewContact = {
          contactId,
          isInterviewTarget: false,
          commStatus: 'pending',
          note: ''
        };
        return {
          ...d,
          contacts: [...d.contacts, contactId],
          interviewContacts: [...d.interviewContacts, newInterviewContact],
          updatedAt: new Date().toISOString()
        };
      })
    })),

    unbindContactFromDispatch: (dispatchId, contactId) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => {
        if (d.id !== dispatchId) return d;
        return {
          ...d,
          contacts: d.contacts.filter(c => c !== contactId),
          interviewContacts: d.interviewContacts.filter(ic => ic.contactId !== contactId),
          updatedAt: new Date().toISOString()
        };
      })
    })),

    setInterviewTarget: (dispatchId, contactId, isTarget) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => {
        if (d.id !== dispatchId) return d;
        return {
          ...d,
          interviewContacts: d.interviewContacts.map(ic =>
            ic.contactId === contactId ? { ...ic, isInterviewTarget: isTarget } : ic
          ),
          updatedAt: new Date().toISOString()
        };
      })
    })),

    setContactCommStatus: (dispatchId, contactId, status) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => {
        if (d.id !== dispatchId) return d;
        return {
          ...d,
          interviewContacts: d.interviewContacts.map(ic =>
            ic.contactId === contactId ? { ...ic, commStatus: status } : ic
          ),
          updatedAt: new Date().toISOString()
        };
      })
    })),

    setContactNote: (dispatchId, contactId, note) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => {
        if (d.id !== dispatchId) return d;
        return {
          ...d,
          interviewContacts: d.interviewContacts.map(ic =>
            ic.contactId === contactId ? { ...ic, note } : ic
          ),
          updatedAt: new Date().toISOString()
        };
      })
    })),

    updateEventPriority: (eventId, priority) => persistedSet((state: any) => ({
      events: state.events.map((e: MediaEvent) => e.id === eventId ? { ...e, priority } : e)
    })),

    addEscalationReason: (eventId, reason) => persistedSet((state: any) => ({
      events: state.events.map((e: MediaEvent) => {
        if (e.id !== eventId) return e;
        const reasons = e.escalationReasons || [];
        if (reasons.includes(reason)) return e;
        return { ...e, escalationReasons: [...reasons, reason] };
      })
    })),

    addEvent: (name, description) => {
      const id = generateId();
      persistedSet((state: any) => ({
        events: [...state.events, {
          id,
          name,
          reports: [],
          firstReportTime: new Date().toISOString(),
          latestReportTime: new Date().toISOString(),
          sentimentShift: false,
          priority: 'medium' as EventPriority,
          description: description || '',
          escalationReasons: []
        }]
      }));
      return id;
    },

    addReportToEvent: (eventId, reportId) => persistedSet((state: any) => ({
      events: state.events.map((e: MediaEvent) => {
        if (e.id !== eventId) return e;
        if (e.reports.includes(reportId)) return e;
        return {
          ...e,
          reports: [...e.reports, reportId],
          latestReportTime: new Date().toISOString()
        };
      }),
      reports: state.reports.map((r: Report) => r.id === reportId ? { ...r, eventId } : r)
    })),

    syncEventFromReports: (eventId) => {
      const state = get();
      const event = state.events.find((e: MediaEvent) => e.id === eventId);
      if (!event) return;

      const eventReports = state.reports.filter((r: Report) => r.eventId === eventId);
      const negativeRiskCount = eventReports.filter((r: Report) => r.sentiment === 'negative' || r.sentiment === 'risk').length;
      const negativeRiskRatio = eventReports.length > 0 ? negativeRiskCount / eventReports.length : 0;

      let newPriority: EventPriority = event.priority;
      const reasons: string[] = [...(event.escalationReasons || [])];

      if (negativeRiskRatio >= 0.5 || negativeRiskCount >= 3) {
        newPriority = 'critical';
        if (!reasons.includes('负面/风险报道占比超50%')) reasons.push('负面/风险报道占比超50%');
      } else if (negativeRiskRatio >= 0.3 || negativeRiskCount >= 2) {
        if (newPriority !== 'critical') newPriority = 'high';
        if (!reasons.includes('多条负面/风险报道')) reasons.push('多条负面/风险报道');
      }

      const hasRisk = eventReports.some((r: Report) => r.sentiment === 'risk');
      if (hasRisk) {
        if (newPriority !== 'critical') newPriority = 'high';
        if (!reasons.includes('存在监管/法律风险报道')) reasons.push('存在监管/法律风险报道');
      }

      const dispatch = state.dispatches.find((d: DispatchRecord) => d.eventId === eventId);
      const updates: Partial<MediaEvent> = {};
      if (newPriority !== event.priority) updates.priority = newPriority;
      if (reasons.length !== (event.escalationReasons || []).length) updates.escalationReasons = reasons;

      if (Object.keys(updates).length > 0) {
        persistedSet((s: any) => ({
          events: s.events.map((e: MediaEvent) => e.id === eventId ? { ...e, ...updates } : e),
          dispatches: s.dispatches.map((d: DispatchRecord) => {
            if (d.eventId !== eventId) return d;
            const needsEscalation = newPriority === 'critical' || newPriority === 'high';
            return {
              ...d,
              needEscalation: needsEscalation,
              escalationLevel: newPriority === 'critical' ? 'executive' : newPriority === 'high' ? 'director' : d.escalationLevel,
              needStatement: negativeRiskCount > 0 || d.needStatement,
              needInterview: hasRisk || d.needInterview,
              updatedAt: new Date().toISOString()
            };
          })
        }));
      }
    },

    findReportByUrl: (url) => {
      const normalizedUrl = url.trim().replace(/\/+$/, '');
      return get().reports.find(r => r.url && r.url.trim().replace(/\/+$/, '') === normalizedUrl);
    },

    findPendingReportByUrl: (url) => {
      const normalizedUrl = url.trim().replace(/\/+$/, '');
      return get().reports.some(r => r.url && r.url.trim().replace(/\/+$/, '') === normalizedUrl);
    },

    resetToMockData: () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('sentiment-platform-data-v1');
      persistedSet({
        reports: mockReports,
        events: defaultEvents,
        contacts: mockContacts,
        dispatches: defaultDispatches,
      });
    },

    getReportsByEvent: (eventId) => get().reports.filter(r => r.eventId === eventId).sort((a, b) => new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime()),

    getDispatchByEvent: (eventId) => get().dispatches.find(d => d.eventId === eventId),

    getContactById: (id) => get().contacts.find(c => c.id === id)
  };
});
