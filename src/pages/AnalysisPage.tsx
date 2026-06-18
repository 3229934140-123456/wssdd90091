import { useState } from 'react';
import { ArrowRight, Clock, Users, TrendingUp, TrendingDown, Minus, Mic, Building2, ShoppingCart, GraduationCap, Newspaper, ChevronRight } from 'lucide-react';
import { useSentimentStore } from '../store/sentimentStore';
import type { MediaEvent, Report, SentimentType } from '../../shared/types';
import { SENTIMENT_CONFIG, MEDIA_LEVEL_CONFIG, VOICE_TYPE_CONFIG, formatFullDateTime, getTimeAgo } from '../../shared/constants';
import { SentimentBadge, MediaLevelBadge, PriorityBadge, SubjectTag } from '../components/Badges';

const sentimentOrder: SentimentType[] = ['positive', 'neutral', 'doubtful', 'negative', 'risk'];

const voiceIcons: Record<string, typeof Mic> = {
  official: Mic,
  regulator: Building2,
  consumer: ShoppingCart,
  expert: GraduationCap,
  media: Newspaper,
};

function getSentimentWeight(s: SentimentType): number {
  const map: Record<SentimentType, number> = {
    positive: 2,
    neutral: 0,
    doubtful: -1,
    negative: -2,
    risk: -3,
  };
  return map[s];
}

function EventCard({ event, selected, onClick }: { event: MediaEvent; selected: boolean; onClick: () => void }) {
  const reports = useSentimentStore(s => s.getReportsByEvent(event.id));
  const reportCount = reports.length;

  return (
    <div
      onClick={onClick}
      className={`card-hoverable p-4 cursor-pointer border-l-4 transition-colors ${selected ? 'bg-navy-50 border-navy-700' : 'border-transparent hover:border-navy-300'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">{event.name}</h3>
        <PriorityBadge priority={event.priority} />
      </div>
      {event.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{event.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Newspaper className="w-3 h-3" />
            {reportCount} 篇
          </span>
          {event.sentimentShift && (
            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
              <TrendingDown className="w-3 h-3" />
              态度转变
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 font-mono">{getTimeAgo(event.latestReportTime)}</span>
      </div>
      <div className="mt-3 flex items-center gap-0.5">
        {reports.slice(0, 8).map(r => (
          <div
            key={r.id}
            className="flex-1 h-1.5 rounded-sm"
            style={{ backgroundColor: SENTIMENT_CONFIG[r.sentiment].color }}
            title={`${r.mediaName} - ${SENTIMENT_CONFIG[r.sentiment].label}`}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineReportNode({ report, first, last, shiftInfo }: { report: Report; first: boolean; last: boolean; shiftInfo?: { from: SentimentType; to: SentimentType } }) {
  const config = SENTIMENT_CONFIG[report.sentiment];
  const voiceType = report.voiceType || 'media';
  const voiceConfig = VOICE_TYPE_CONFIG[voiceType];
  const VoiceIcon = voiceIcons[voiceType] || Newspaper;

  return (
    <div className="relative flex gap-4 pl-2 pb-6">
      {!last && (
        <div
          className="absolute left-[15px] top-7 bottom-0 w-px"
          style={{ background: `linear-gradient(to bottom, ${config.color}, ${SENTIMENT_CONFIG.negative.color}66)` }}
        />
      )}
      <div className="relative shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md z-10"
          style={{ backgroundColor: config.color }}
        >
          <VoiceIcon className="w-4 h-4" />
        </div>
        {shiftInfo && (
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-sm text-[10px] whitespace-nowrap">
            <span style={{ color: SENTIMENT_CONFIG[shiftInfo.from].color }}>{SENTIMENT_CONFIG[shiftInfo.from].label}</span>
            <ArrowRight className="w-3 h-3 text-amber-600" />
            <span style={{ color: SENTIMENT_CONFIG[shiftInfo.to].color }}>{SENTIMENT_CONFIG[shiftInfo.to].label}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 animate-fade-in">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <SentimentBadge sentiment={report.sentiment} />
          <span className="text-xs font-medium text-navy-700">{report.mediaName}</span>
          <MediaLevelBadge level={report.mediaLevel} />
          <span className={`text-xs ${voiceConfig.color}`}>
            <span className="inline-flex items-center gap-1">
              <VoiceIcon className="w-3 h-3" />
              {voiceConfig.label}
            </span>
          </span>
        </div>
        <h4 className="font-serif font-semibold text-sm text-gray-900 mb-1.5 leading-snug">{report.title}</h4>
        {report.summary && (
          <p className="text-xs text-gray-600 mb-2 leading-relaxed">{report.summary}</p>
        )}
        {report.keySentences.length > 0 && (
          <div className="bg-yellow-50/60 border-l-2 border-yellow-400 pl-3 py-1.5 mb-2">
            {report.keySentences.slice(0, 1).map(ks => (
              <p key={ks.id} className="text-xs text-gray-700">
                <span className="font-medium text-yellow-800">关键句：</span>
                {ks.text}
                <span className="text-gray-400 ml-1">（{ks.reason}）</span>
              </p>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {report.subjects.map(s => <SubjectTag key={s} label={s} />)}
          </div>
          <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatFullDateTime(report.publishTime)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const events = useSentimentStore(s => s.events);
  const getReportsByEvent = useSentimentStore(s => s.getReportsByEvent);
  const [selectedEventId, setSelectedEventId] = useState<string>(events.find(e => e.priority === 'critical')?.id || events[0]?.id);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventReports = selectedEvent ? getReportsByEvent(selectedEvent.id) : [];

  const calculateSentimentShifts = (reports: Report[]) => {
    const shifts: Record<string, { from: SentimentType; to: SentimentType }> = {};
    const mediaReports: Record<string, Report[]> = {};
    reports.forEach(r => {
      if (!mediaReports[r.mediaName]) mediaReports[r.mediaName] = [];
      mediaReports[r.mediaName].push(r);
    });
    Object.entries(mediaReports).forEach(([media, list]) => {
      if (list.length >= 2) {
        const sorted = list.sort((a, b) => new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime());
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        if (getSentimentWeight(last.sentiment) < getSentimentWeight(first.sentiment)) {
          shifts[last.id] = { from: first.sentiment, to: last.sentiment };
        }
      }
    });
    return shifts;
  };

  const shifts = selectedEvent ? calculateSentimentShifts(eventReports) : {};

  const mediaDistribution = () => {
    const dist: Record<string, { total: number; bySentiment: Record<SentimentType, number> }> = {};
    eventReports.forEach(r => {
      if (!dist[r.mediaName]) {
        dist[r.mediaName] = {
          total: 0,
          bySentiment: { positive: 0, neutral: 0, doubtful: 0, negative: 0, risk: 0 }
        };
      }
      dist[r.mediaName].total++;
      dist[r.mediaName].bySentiment[r.sentiment]++;
    });
    return dist;
  };

  const dist = mediaDistribution();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">倾向判读</h1>
          <p className="text-sm text-gray-500 mt-1">追踪事件舆情演化，识别态度转向与风险信号</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">活跃事件</p>
            <p className="text-xl font-mono font-bold text-navy-700">{events.filter(e => e.priority !== 'low').length}</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-right">
            <p className="text-xs text-gray-500">态度转变</p>
            <p className="text-xl font-mono font-bold text-amber-600">{events.filter(e => e.sentimentShift).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" strokeWidth={1.8} />
            事件看板
            <span className="text-xs text-gray-400 font-normal">({events.length} 个)</span>
          </h2>
          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                selected={event.id === selectedEventId}
                onClick={() => setSelectedEventId(event.id)}
              />
            ))}
          </div>
        </div>

        <div className="col-span-5">
          {selectedEvent && (
            <>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <PriorityBadge priority={selectedEvent.priority} />
                  <h2 className="font-serif font-bold text-lg text-gray-900">{selectedEvent.name}</h2>
                </div>
                {selectedEvent.description && (
                  <p className="text-sm text-gray-600 mb-3">{selectedEvent.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatFullDateTime(selectedEvent.firstReportTime)} 首发
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>{formatFullDateTime(selectedEvent.latestReportTime)} 最新</span>
                  <span className="ml-auto inline-flex items-center gap-1">
                    <Newspaper className="w-3.5 h-3.5" />
                    共 {eventReports.length} 篇报道
                  </span>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" strokeWidth={1.8} />
                  舆情演化时间线
                  {selectedEvent.sentimentShift && (
                    <span className="text-xs font-normal text-amber-600 ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded-sm">
                      <ArrowRight className="w-3 h-3" />
                      检测到媒体态度转向
                    </span>
                  )}
                </h3>
                <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                  {eventReports.map((report, idx) => (
                    <TimelineReportNode
                      key={report.id}
                      report={report}
                      first={idx === 0}
                      last={idx === eventReports.length - 1}
                      shiftInfo={shifts[report.id]}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="col-span-3 space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">媒体报道分布</h3>
            <div className="space-y-2.5">
              {Object.entries(dist).sort((a, b) => b[1].total - a[1].total).map(([media, data]) => (
                <div key={media}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{media}</span>
                    <span className="text-xs text-gray-400 font-mono">{data.total}</span>
                  </div>
                  <div className="flex gap-0.5 h-2 rounded-sm overflow-hidden">
                    {sentimentOrder.map(s => {
                      const count = data.bySentiment[s];
                      if (count === 0) return null;
                      return (
                        <div
                          key={s}
                          className="h-full transition-all"
                          style={{
                            width: `${(count / data.total) * 100}%`,
                            backgroundColor: SENTIMENT_CONFIG[s].color,
                          }}
                          title={`${SENTIMENT_CONFIG[s].label}: ${count}篇`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">声音来源分析</h3>
            <div className="space-y-2">
              {Object.entries(VOICE_TYPE_CONFIG).map(([type, config]) => {
                const count = eventReports.filter(r => (r.voiceType || 'media') === type).length;
                if (count === 0) return null;
                const Icon = voiceIcons[type];
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center ${config.color} bg-gray-50`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-gray-600 flex-1">{config.label}</span>
                    <span className="text-xs font-mono font-semibold text-gray-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">倾向分布统计</h3>
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {sentimentOrder.map(s => {
                const count = eventReports.filter(r => r.sentiment === s).length;
                const config = SENTIMENT_CONFIG[s];
                return (
                  <div key={s} className="text-center">
                    <div
                      className="text-lg font-mono font-bold py-2 rounded-sm"
                      style={{ backgroundColor: `${config.color}14`, color: config.color }}
                    >
                      {count}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{config.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-0.5 h-3 rounded-sm overflow-hidden">
              {sentimentOrder.map(s => {
                const count = eventReports.filter(r => r.sentiment === s).length;
                if (count === 0) return null;
                return (
                  <div
                    key={s}
                    className="h-full"
                    style={{
                      width: `${(count / eventReports.length) * 100}%`,
                      backgroundColor: SENTIMENT_CONFIG[s].color,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="card p-4 border-l-4 border-amber-400 bg-amber-50/30">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <Minus className="w-4 h-4 text-amber-600" />
              研判摘要
            </h3>
            <ul className="text-xs text-gray-600 space-y-1.5">
              {selectedEvent?.sentimentShift && (
                <li className="flex gap-1.5">
                  <span className="text-amber-600">•</span>
                  多家媒体态度发生转变，从客观报道转向质疑追问
                </li>
              )}
              {eventReports.some(r => r.voiceType === 'regulator') && (
                <li className="flex gap-1.5">
                  <span className="text-red-600">•</span>
                  出现监管声音，需重点关注合规风险
                </li>
              )}
              {eventReports.some(r => r.voiceType === 'consumer') && (
                <li className="flex gap-1.5">
                  <span className="text-orange-600">•</span>
                  涉及消费者反馈，建议评估对品牌口碑的影响
                </li>
              )}
              {eventReports.filter(r => r.sentiment === 'risk' || r.sentiment === 'negative').length >= 3 && (
                <li className="flex gap-1.5">
                  <span className="text-red-600">•</span>
                  负面/风险报道占比较高，建议启动正式响应
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
