import { create } from 'zustand';
import type { Report, MediaEvent, Contact, DispatchRecord, SentimentType, MediaLevel, ReachScope, DispatchStatus, EscalationLevel } from '../../shared/types';
import { mockReports, mockEvents, mockContacts, mockDispatches } from '../../shared/mockData';
import { generateId } from '../../shared/constants';

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

  getReportsByEvent: (eventId: string) => Report[];
  getDispatchByEvent: (eventId: string) => DispatchRecord | undefined;
  getContactById: (id: string) => Contact | undefined;
}

export const useSentimentStore = create<SentimentStore>((set, get) => ({
  reports: mockReports,
  events: mockEvents,
  contacts: mockContacts,
  dispatches: mockDispatches,
  selectedEventId: null,
  selectedReportId: null,
  selectedDispatchId: null,

  addReport: (report) => set((state) => ({
    reports: [...state.reports, {
      ...report,
      id: generateId(),
      createdAt: new Date().toISOString(),
      originalSentiment: report.sentiment
    }]
  })),

  addReports: (newReports) => set((state) => ({
    reports: [...state.reports, ...newReports.map(r => ({
      ...r,
      id: generateId(),
      createdAt: new Date().toISOString(),
      originalSentiment: r.sentiment
    }))]
  })),

  updateReport: (id, updates) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, ...updates } : r)
  })),

  updateReportSentiment: (id, sentiment) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, sentiment } : r)
  })),

  updateReportSubjects: (id, subjects) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, subjects } : r)
  })),

  updateReportMediaLevel: (id, mediaLevel) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, mediaLevel } : r)
  })),

  updateReportReachScope: (id, reachScope) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, reachScope } : r)
  })),

  setSelectedEvent: (id) => set({ selectedEventId: id }),
  setSelectedReport: (id) => set({ selectedReportId: id }),
  setSelectedDispatch: (id) => set({ selectedDispatchId: id }),

  addDispatch: (dispatch) => set((state) => ({
    dispatches: [...state.dispatches, {
      ...dispatch,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followUpNotes: dispatch.followUpNotes?.map((content, idx) => ({
        id: generateId(),
        content,
        createdAt: new Date(Date.now() + idx * 1000).toISOString()
      })) || []
    }]
  })),

  updateDispatch: (id, updates) => set((state) => ({
    dispatches: state.dispatches.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)
  })),

  updateDispatchStatus: (id, status) => set((state) => ({
    dispatches: state.dispatches.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d)
  })),

  updateDispatchStatement: (id, statement) => set((state) => ({
    dispatches: state.dispatches.map(d => d.id === id ? { ...d, statement, updatedAt: new Date().toISOString() } : d)
  })),

  addFollowUpNote: (dispatchId, content) => set((state) => ({
    dispatches: state.dispatches.map(d => d.id === dispatchId ? {
      ...d,
      followUpNotes: [...d.followUpNotes, { id: generateId(), content, createdAt: new Date().toISOString() }],
      updatedAt: new Date().toISOString()
    } : d)
  })),

  updateDispatchEscalation: (id, level) => set((state) => ({
    dispatches: state.dispatches.map(d => d.id === id ? { ...d, escalationLevel: level, updatedAt: new Date().toISOString() } : d)
  })),

  addContact: (contact) => set((state) => ({
    contacts: [...state.contacts, { ...contact, id: generateId() }]
  })),

  updateContact: (id, updates) => set((state) => ({
    contacts: state.contacts.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  getReportsByEvent: (eventId) => get().reports.filter(r => r.eventId === eventId).sort((a, b) => new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime()),

  getDispatchByEvent: (eventId) => get().dispatches.find(d => d.eventId === eventId),

  getContactById: (id) => get().contacts.find(c => c.id === id)
}));
