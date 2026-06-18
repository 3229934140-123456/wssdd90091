import { Router } from 'express';
import type { Request, Response } from 'express';
import { mockReports, mockEvents, mockContacts, mockDispatches } from '../../shared/mockData.js';
import { generateId } from '../../shared/constants.js';
import type { Report, MediaEvent, DispatchRecord, Contact, SentimentType, MediaLevel, ReachScope, DispatchStatus } from '../../shared/types.js';

const router = Router();

let reports: Report[] = [...mockReports];
let events: MediaEvent[] = [...mockEvents];
let dispatches: DispatchRecord[] = [...mockDispatches];
let contacts: Contact[] = [...mockContacts];

router.get('/reports', (req: Request, res: Response) => {
  const { eventId } = req.query;
  let result = [...reports];
  if (eventId) {
    result = result.filter(r => r.eventId === eventId);
  }
  result.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime());
  res.json({ success: true, data: result });
});

router.post('/reports', (req: Request, res: Response) => {
  const body = req.body as Partial<Report> | Partial<Report>[];
  if (Array.isArray(body)) {
    const newReports = body.map(r => ({
      ...r,
      id: generateId(),
      createdAt: new Date().toISOString(),
      originalSentiment: r.sentiment || 'neutral',
      keySentences: r.keySentences || [],
      subjects: r.subjects || [],
      mediaLevel: r.mediaLevel || 'industry' as MediaLevel,
      reachScope: r.reachScope || 'local' as ReachScope,
      sentiment: r.sentiment || 'neutral' as SentimentType,
      source: r.source || 'manual'
    })) as Report[];
    reports = [...reports, ...newReports];
    res.json({ success: true, data: newReports });
  } else {
    const newReport: Report = {
      ...body,
      id: generateId(),
      createdAt: new Date().toISOString(),
      originalSentiment: body.sentiment || 'neutral',
      keySentences: body.keySentences || [],
      subjects: body.subjects || [],
      mediaLevel: body.mediaLevel || 'industry' as MediaLevel,
      reachScope: body.reachScope || 'local' as ReachScope,
      sentiment: body.sentiment || 'neutral' as SentimentType,
      source: body.source || 'manual',
      title: body.title || '未命名报道',
      mediaName: body.mediaName || '未知来源',
      publishTime: body.publishTime || new Date().toISOString()
    } as Report;
    reports = [...reports, newReport];
    res.json({ success: true, data: newReport });
  }
});

router.put('/reports/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as Partial<Report>;
  reports = reports.map(r => r.id === id ? { ...r, ...updates } : r);
  const updated = reports.find(r => r.id === id);
  res.json({ success: true, data: updated });
});

router.get('/events', (_req: Request, res: Response) => {
  res.json({ success: true, data: events });
});

router.get('/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const event = events.find(e => e.id === id);
  if (!event) {
    res.status(404).json({ success: false, error: '事件不存在' });
    return;
  }
  const eventReports = reports.filter(r => r.eventId === id).sort((a, b) => new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime());
  res.json({ success: true, data: { ...event, reports: eventReports } });
});

router.get('/dispatches', (_req: Request, res: Response) => {
  res.json({ success: true, data: dispatches });
});

router.post('/dispatches', (req: Request, res: Response) => {
  const body = req.body as Partial<DispatchRecord>;
  const now = new Date().toISOString();
  const newDispatch: DispatchRecord = {
    ...body,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    status: body.status || 'pending' as DispatchStatus,
    statement: body.statement || '',
    contacts: body.contacts || [],
    followUpNotes: body.followUpNotes || [],
    escalationLevel: body.escalationLevel || 'normal',
    needStatement: body.needStatement || false,
    needInterview: body.needInterview || false,
    needEscalation: body.needEscalation || false
  } as DispatchRecord;
  dispatches = [...dispatches, newDispatch];
  res.json({ success: true, data: newDispatch });
});

router.put('/dispatches/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as Partial<DispatchRecord>;
  dispatches = dispatches.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
  const updated = dispatches.find(d => d.id === id);
  res.json({ success: true, data: updated });
});

router.get('/contacts', (_req: Request, res: Response) => {
  res.json({ success: true, data: contacts });
});

router.post('/contacts', (req: Request, res: Response) => {
  const body = req.body as Omit<Contact, 'id'>;
  const newContact: Contact = { ...body, id: generateId() };
  contacts = [...contacts, newContact];
  res.json({ success: true, data: newContact });
});

export default router;
