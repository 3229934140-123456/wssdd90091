export type SentimentType = 'positive' | 'neutral' | 'negative' | 'doubtful' | 'risk';

export type MediaLevel = 'national' | 'finance' | 'portal' | 'selfmedia' | 'industry';

export type ReachScope = 'local' | 'regional' | 'national' | 'viral';

export type DispatchStatus = 'pending' | 'responding' | 'responded' | 'closed';

export type ReportSource = 'url' | 'file' | 'manual';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export type EscalationLevel = 'normal' | 'manager' | 'director' | 'executive';

export type RelationshipLevel = 'friendly' | 'neutral' | 'difficult';

export type ContactCommStatus = 'pending' | 'contacted' | 'responded' | 'declined';

export interface KeySentence {
  id: string;
  text: string;
  reason: string;
  position: number;
}

export interface Report {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  url?: string;
  source: ReportSource;
  mediaName: string;
  mediaLevel: MediaLevel;
  publishTime: string;
  sentiment: SentimentType;
  originalSentiment: SentimentType;
  keySentences: KeySentence[];
  subjects: string[];
  reachScope: ReachScope;
  eventId?: string;
  createdAt: string;
  voiceType?: 'official' | 'regulator' | 'consumer' | 'expert' | 'media';
}

export interface MediaEvent {
  id: string;
  name: string;
  reports: string[];
  firstReportTime: string;
  latestReportTime: string;
  sentimentShift: boolean;
  priority: EventPriority;
  description?: string;
  escalationReasons?: string[];
}

export interface InterviewContact {
  contactId: string;
  isInterviewTarget: boolean;
  commStatus: ContactCommStatus;
  note?: string;
}

export interface Contact {
  id: string;
  name: string;
  media: string;
  title: string;
  phone: string;
  email: string;
  relationship: RelationshipLevel;
  lastContact?: string;
}

export interface DispatchRecord {
  id: string;
  eventId: string;
  status: DispatchStatus;
  statement: string;
  contacts: string[];
  interviewContacts: InterviewContact[];
  followUpNotes: { id: string; content: string; createdAt: string }[];
  escalationLevel: EscalationLevel;
  createdAt: string;
  updatedAt: string;
  needStatement: boolean;
  needInterview: boolean;
  needEscalation: boolean;
}

export interface PendingReport {
  tempId: string;
  title: string;
  content: string;
  summary?: string;
  url?: string;
  source: ReportSource;
  mediaName: string;
  mediaLevel: MediaLevel;
  publishTime: string;
  sentiment: SentimentType;
  keySentences: KeySentence[];
  subjects: string[];
  reachScope: ReachScope;
  fileName?: string;
  fileSize?: number;
  recognizedText?: string;
}
