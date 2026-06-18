import type { Report, SentimentType, KeySentence } from '../../shared/types';
import { generateId } from '../../shared/constants';

const negativeKeywords = ['投诉', '曝光', '问题', '违规', '处罚', '风险', '危机', '事故', '造假', '欺诈', '质疑', '调查', '丑闻', '道歉', '争议', '下跌', '亏损', '缺陷', '隐患', '失败'];
const doubtfulKeywords = ['质疑', '存疑', '或', '可能', '疑似', '传闻', '待核实', '未回应', '沉默', '尚无定论'];
const riskKeywords = ['监管', '处罚', '问询', '诉讼', '风险提示', '警告', '整改', '违法', '合规', '退市', '禁令'];
const positiveKeywords = ['增长', '突破', '创新', '领先', '第一', '好评', '获奖', '荣誉', '突破', '成功', '发布', '发布新', '合作', '拓展'];

function detectSentiment(text: string): SentimentType {
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

export function analyzeReport(title: string, content: string, mediaName: string = '未知来源'): Omit<Report, 'id' | 'createdAt' | 'originalSentiment'> {
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
    publishTime: new Date().toISOString(),
    sentiment,
    keySentences,
    subjects: [],
    reachScope: 'local'
  };
}

export function analyzeUrlReport(url: string): Omit<Report, 'id' | 'createdAt' | 'originalSentiment'> {
  const titles = [
    '某科技公司新品发布会引关注，性能参数成焦点',
    '行业协会发布年度报告，头部企业市场份额持续扩大',
    '消费者投诉平台数据显示：售后服务问题成重灾区',
    '监管部门开展专项检查，多家企业被点名',
    '第三方机构发布评测报告：产品质量参差不齐'
  ];
  const contents = [
    '近日，某科技公司召开新品发布会，推出了旗下最新产品线。据官方介绍，新产品在性能方面实现了重大突破，多项参数达到行业领先水平。不过，也有业内专家指出，部分指标的实际表现仍需市场检验，消费者应理性看待宣传数据。截至发稿，已有部分用户在社交媒体分享初步使用体验，评价呈现两极分化趋势。',
    '行业协会今日发布2026年度行业白皮书。报告显示，头部企业市场份额较去年进一步扩大，行业集中度持续提升。报告同时指出，中小企业面临较大竞争压力，创新能力不足和资金链紧张是主要瓶颈。多位业内人士呼吁，应建立更加公平的市场竞争环境，鼓励多元化发展。',
    '据全国消费者投诉平台最新统计数据，今年上半年售后服务类投诉量同比增长47%。投诉主要集中在三个方面：一是商品出现质量问题后退换货困难；二是承诺的上门服务未兑现；三是客服热线长期无法接通。消协相关负责人表示，将对投诉量排名靠前的企业进行约谈，督促其改进服务质量。',
    '监管部门近日宣布开展为期三个月的行业专项检查行动。本次检查重点关注产品质量合规、消费者权益保护、数据安全等方面。据知情人士透露，已有多家企业在前期抽查中被发现存在不同程度的问题，部分问题严重的企业可能面临行政处罚。监管部门强调，对违法违规行为将保持"零容忍"态度。',
    '某权威第三方评测机构今日发布最新一期产品质量评测报告。报告覆盖了市场上主流品牌的50余款产品，从安全性、耐用性、性能表现等多个维度进行了综合评分。结果显示，各品牌产品质量参差不齐，部分知名品牌产品也存在一定的质量隐患。机构建议消费者在购买前仔细查阅评测报告，谨慎做出选择。'
  ];
  const mediaNames = ['财经日报', '21世纪经济报道', '证券时报', '澎湃新闻', '界面新闻'];
  const randIdx = Math.floor(Math.random() * titles.length);

  const title = titles[randIdx];
  const content = contents[randIdx];
  const sentiment = detectSentiment(title + content);
  const keySentences = extractKeySentences(content, sentiment);

  return {
    title,
    content,
    summary: content.slice(0, 100) + '...',
    url,
    source: 'url',
    mediaName: mediaNames[randIdx],
    mediaLevel: randIdx < 3 ? 'finance' : 'portal',
    publishTime: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    sentiment,
    keySentences,
    subjects: [],
    reachScope: Math.random() > 0.5 ? 'national' : 'regional'
  };
}
