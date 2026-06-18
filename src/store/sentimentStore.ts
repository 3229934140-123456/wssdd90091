import { create } from 'zustand';
import type { Report, MediaEvent, Contact, DispatchRecord, SentimentType, MediaLevel, ReachScope, DispatchStatus, EscalationLevel } from '../../shared/types';
import { mockReports, mockEvents, mockContacts, mockDispatches } from '../../shared/mockData';
import { generateId } from '../../shared/constants';

const STORAGE_KEY = 'sentiment-platform-data-v1';

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
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return null;
}

function saveToStorage(data: Omit<PersistedData, 'initialized'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, initialized: true }));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

const stored = loadFromStorage();

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

  addDispatch: (dispatch: Omit<DispatchRecord, 'id' | 'createdAt' | 'updatedAt' | 'followUpNotes'> & { followUpNotes?: string[] }) => void;
  updateDispatch: (id: string, updates: Partial<DispatchRecord>) => void;
  updateDispatchStatus: (id: string, status: DispatchStatus) => void;
  updateDispatchStatement: (id: string, statement: string) => void;
  addFollowUpNote: (dispatchId: string, content: string) => void;
  updateDispatchEscalation: (id: string, level: EscalationLevel) => void;

  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;

  bindContactToDispatch: (dispatchId: string, contactId: string) => void;
  unbindContactFromDispatch: (dispatchId: string, contactId: string) => void;

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
    events: stored?.events ?? mockEvents,
    contacts: stored?.contacts ?? mockContacts,
    dispatches: stored?.dispatches ?? mockDispatches,
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

    updateReport: (id, updates) => persistedSet((state: any) => ({
      reports: state.reports.map((r: Report) => r.id === id ? { ...r, ...updates } : r)
    })),

    updateReportSentiment: (id, sentiment) => persistedSet((state: any) => ({
      reports: state.reports.map((r: Report) => r.id === id ? { ...r, sentiment } : r)
    })),

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
        })) || []
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
        return { ...d, contacts: [...d.contacts, contactId], updatedAt: new Date().toISOString() };
      })
    })),

    unbindContactFromDispatch: (dispatchId, contactId) => persistedSet((state: any) => ({
      dispatches: state.dispatches.map((d: DispatchRecord) => {
        if (d.id !== dispatchId) return d;
        return { ...d, contacts: d.contacts.filter(c => c !== contactId), updatedAt: new Date().toISOString() };
      })
    })),

    resetToMockData: () => {
      localStorage.removeItem(STORAGE_KEY);
      persistedSet({
        reports: mockReports,
        events: mockEvents,
        contacts: mockContacts,
        dispatches: mockDispatches,
      });
    },

    getReportsByEvent: (eventId) => get().reports.filter(r => r.eventId === eventId).sort((a, b) => new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime()),

    getDispatchByEvent: (eventId) => get().dispatches.find(d => d.eventId === eventId),

    getContactById: (id) => get().contacts.find(c => c.id === id)
  };
});
