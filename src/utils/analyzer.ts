import type { Report, SentimentType, KeySentence, PendingReport, ReportSource, MediaLevel, ReachScope } from '../../shared/types';
import { generateId } from '../../shared/constants';

const negativeKeywords = ['投诉', '曝光', '问题', '违规', '处罚', '风险', '危机', '事故', '造假', '欺诈', '质疑', '调查', '丑闻', '道歉', '争议', '下跌', '亏损', '缺陷', '隐患', '失败'];
const doubtfulKeywords = ['质疑', '存疑', '或', '可能', '疑似', '传闻', '待核实', '未回应', '沉默', '尚无定论'];
const riskKeywords = ['监管', '处罚', '问询', '诉讼', '风险提示', '警告', '整改', '违法', '合规', '退市', '禁令'];
const positiveKeywords = ['增长', '突破', '创新', '领先', '第一', '好评', '获奖', '荣誉', '成功', '发布', '合作', '拓展'];

export function detectSentiment(text: string): SentimentType {
  let score = 0;
  let riskScore = 0;
  let doubtScore = 0;

  for (const kw of riskKeywords) {
    if (text.includes(kw)) riskScore += 2;
  }
  for (const kw of doubtfulKeywords) {
    if (text.includes(kw)) doubtScore += 1.5;
  }
  for (const kw of negativeKeywords) {
    if (text.includes(kw)) score -= 1;
  }
  for (const kw of positiveKeywords) {
    if (text.includes(kw)) score += 1;
  }

  if (riskScore >= 2) return 'risk';
  if (doubtScore >= 2 && score < 0) return 'doubtful';
  if (doubtScore >= 1.5 && score <= 0) return 'doubtful';
  if (score <= -2) return 'negative';
  if (score >= 1) return 'positive';
  return 'neutral';
}

function extractKeySentences(text: string, sentiment: SentimentType): KeySentence[] {
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 4);
  const result: KeySentence[] = [];
  const allKeywords = [...negativeKeywords, ...doubtfulKeywords, ...riskKeywords, ...positiveKeywords];

  let pos = 0;
  for (const sentence of sentences) {
    const idx = text.indexOf(sentence);
    if (idx >= 0) pos = idx;
    const hasKeyword = allKeywords.some(kw => sentence.includes(kw));
    if (hasKeyword && result.length < 3) {
      let reason = '';
      if (riskKeywords.some(kw => sentence.includes(kw))) reason = '涉及监管/法律风险';
      else if (negativeKeywords.some(kw => sentence.includes(kw))) reason = '负面描述或指控';
      else if (doubtfulKeywords.some(kw => sentence.includes(kw))) reason = '存疑或未确认信息';
      else if (positiveKeywords.some(kw => sentence.includes(kw))) reason = '正面描述或肯定';
      else reason = '值得关注的表述';

      result.push({
        id: generateId(),
        text: sentence.trim(),
        reason,
        position: pos
      });
    }
  }

  return result;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : url.split('/')[0];
  }
}

function extractTitleClue(url: string): string {
  try {
    const u = new URL(url);
    const pathSegments = u.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || '';
    const decoded = decodeURIComponent(lastSegment)
      .replace(/[-_]/g, ' ')
      .replace(/\.\w+$/, '')
      .trim();
    if (decoded.length > 2) return decoded;
  } catch {}
  return '';
}

const domainMediaMap: Record<string, { mediaName: string; mediaLevel: MediaLevel }> = {
  'finance.sina.com.cn': { mediaName: '新浪财经', mediaLevel: 'portal' },
  'caixin.com': { mediaName: '财新网', mediaLevel: 'finance' },
  '21jingji.com': { mediaName: '21世纪经济报道', mediaLevel: 'finance' },
  'thepaper.cn': { mediaName: '澎湃新闻', mediaLevel: 'portal' },
  'stcn.com': { mediaName: '证券时报', mediaLevel: 'national' },
  'jjckb.cn': { mediaName: '经济参考报', mediaLevel: 'national' },
  'people.com.cn': { mediaName: '人民网', mediaLevel: 'national' },
  'xinhuanet.com': { mediaName: '新华网', mediaLevel: 'national' },
  'cctv.com': { mediaName: '央视网', mediaLevel: 'national' },
  'finance.qq.com': { mediaName: '腾讯财经', mediaLevel: 'portal' },
  'caijing.com': { mediaName: '财经网', mediaLevel: 'finance' },
  'jiemian.com': { mediaName: '界面新闻', mediaLevel: 'finance' },
  'yicai.com': { mediaName: '第一财经', mediaLevel: 'finance' },
  '36kr.com': { mediaName: '36氪', mediaLevel: 'industry' },
  'ifeng.com': { mediaName: '凤凰网', mediaLevel: 'portal' },
  'sohu.com': { mediaName: '搜狐新闻', mediaLevel: 'portal' },
  '163.com': { mediaName: '网易新闻', mediaLevel: 'portal' },
  'guancha.cn': { mediaName: '观察者网', mediaLevel: 'portal' },
};

function inferMediaFromDomain(domain: string): { mediaName: string; mediaLevel: MediaLevel } {
  for (const [key, val] of Object.entries(domainMediaMap)) {
    if (domain.includes(key) || key.includes(domain)) return val;
  }
  const parts = domain.split('.');
  const mainPart = parts[0];
  const capitalizedName = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  return { mediaName: capitalizedName, mediaLevel: 'industry' };
}

function inferReachFromLevel(level: MediaLevel): ReachScope {
  if (level === 'national') return 'national';
  if (level === 'finance' || level === 'portal') return 'national';
  if (level === 'selfmedia') return 'regional';
  return 'local';
}

export function analyzeReport(title: string, content: string, mediaName: string = '未知来源', publishTime?: string): Omit<Report, 'id' | 'createdAt' | 'originalSentiment'> {
  const fullText = title + ' ' + content;
  const sentiment = detectSentiment(fullText);
  const keySentences = extractKeySentences(content || title, sentiment);

  return {
    title,
    content: content || title,
    summary: content ? content.slice(0, 100) + (content.length > 100 ? '...' : '') : undefined,
    source: 'manual',
    mediaName,
    mediaLevel: 'industry',
    publishTime: publishTime || new Date().toISOString(),
    sentiment,
    keySentences,
    subjects: [],
    reachScope: 'local'
  };
}

export function analyzeUrlReport(url: string): PendingReport {
  const domain = extractDomain(url);
  const mediaInfo = inferMediaFromDomain(domain);
  const titleClue = extractTitleClue(url);
  const hash = simpleHash(url);

  const titleFromClue = titleClue.length > 4
    ? titleClue.charAt(0).toUpperCase() + titleClue.slice(1)
    : `${mediaInfo.mediaName}报道`;

  const contentFromUrl = `【来源链接：${url}】\n【来源媒体：${mediaInfo.mediaName}（${domain}）】\n\n以下为根据链接推断的报道摘要，请编辑补正全文内容：\n${titleClue ? `报道主题可能涉及：${titleClue}` : '请根据链接内容填写报道摘要和正文'}`;

  const sentiment = detectSentiment(titleFromClue + ' ' + contentFromUrl);
  const keySentences = extractKeySentences(contentFromUrl, sentiment);

  const publishTime = new Date(Date.now() - (hash % 3) * 86400000).toISOString();

  return {
    tempId: generateId(),
    title: titleFromClue,
    content: contentFromUrl,
    summary: contentFromUrl.slice(0, 100) + '...',
    url,
    source: 'url',
    mediaName: mediaInfo.mediaName,
    mediaLevel: mediaInfo.mediaLevel,
    publishTime,
    sentiment,
    keySentences,
    subjects: [],
    reachScope: inferReachFromLevel(mediaInfo.mediaLevel)
  };
}

export interface FileImportResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  report: PendingReport;
}

async function readFileAsText(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (file.type === 'application/pdf') {
      resolve(null);
      return;
    }
    if (file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : null;
        resolve(text);
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
      return;
    }
    resolve(null);
  });
}

export async function analyzeFile(file: File): Promise<FileImportResult> {
  const fileText = await readFileAsText(file);
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  let title: string;
  let content: string;
  let recognizedText: string;
  let mediaName: string;
  let mediaLevel: MediaLevel;
  let reachScope: ReachScope;

  if (fileText && fileText.trim().length > 10) {
    recognizedText = fileText.trim();
    const lines = recognizedText.split('\n').filter(l => l.trim());
    title = lines[0].length > 50 ? lines[0].slice(0, 50) + '...' : lines[0];
    content = `【OCR识别自文件：${file.name}】\n\n${recognizedText}`;
    mediaName = '文本导入';
    mediaLevel = 'industry';
    reachScope = 'local';
  } else {
    recognizedText = '';
    const typeLabel = isPdf ? 'PDF文档' : isImage ? '图片' : '文件';
    title = `${baseName} — ${typeLabel}剪报（待补正文）`;
    content = `【OCR识别自文件：${file.name}】\n【文件类型：${typeLabel}，大小：${(file.size / 1024).toFixed(1)}KB】\n\n⚠️ 该${typeLabel}无法自动识别文本内容，请在下方编辑区补录报道全文：\n\n[待补全文稿]`;
    mediaName = '剪报来源（待确认）';
    mediaLevel = 'industry';
    reachScope = 'local';
  }

  const sentiment = detectSentiment(title + ' ' + (recognizedText || ''));
  const keySentences = recognizedText
    ? extractKeySentences(recognizedText, sentiment)
    : [];

  const hash = simpleHash(file.name + file.size);
  const publishTime = new Date(Date.now() - (hash % 5) * 86400000).toISOString();

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    report: {
      tempId: generateId(),
      title,
      content,
      summary: recognizedText ? recognizedText.slice(0, 100) + '...' : '无法自动识别，请手动补录内容',
      source: 'file',
      mediaName,
      mediaLevel,
      publishTime,
      sentiment,
      keySentences,
      subjects: [],
      reachScope,
      fileName: file.name,
      fileSize: file.size,
      recognizedText: recognizedText || undefined
    }
  };
}

export function getUrlHash(url: string): string {
  return simpleHash(url).toString();
}

export function findDuplicateUrl(existingReports: Report[], url: string): Report | undefined {
  const normalizedUrl = url.trim().replace(/\/+$/, '');
  return existingReports.find(r => r.url && r.url.trim().replace(/\/+$/, '') === normalizedUrl);
}
