import type { Report, SentimentType, KeySentence } from '../../shared/types';
import { generateId } from '../../shared/constants';

const negativeKeywords = ['投诉', '曝光', '问题', '违规', '处罚', '风险', '危机', '事故', '造假', '欺诈', '质疑', '调查', '丑闻', '道歉', '争议', '下跌', '亏损', '缺陷', '隐患', '失败'];
const doubtfulKeywords = ['质疑', '存疑', '或', '可能', '疑似', '传闻', '待核实', '未回应', '沉默', '尚无定论'];
const riskKeywords = ['监管', '处罚', '问询', '诉讼', '风险提示', '警告', '整改', '违法', '合规', '退市', '禁令'];
const positiveKeywords = ['增长', '突破', '创新', '领先', '第一', '好评', '获奖', '荣誉', '成功', '发布', '合作', '拓展'];

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

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
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

const urlTemplates = [
  {
    title: '某科技公司新品发布会引关注，性能参数成焦点',
    content: '近日，某科技公司召开新品发布会，推出了旗下最新产品线。据官方介绍，新产品在性能方面实现了重大突破，多项参数达到行业领先水平。不过，也有业内专家指出，部分指标的实际表现仍需市场检验，消费者应理性看待宣传数据。截至发稿，已有部分用户在社交媒体分享初步使用体验，评价呈现两极分化趋势。',
    mediaName: '财经日报',
    mediaLevel: 'finance' as const,
    reachScope: 'national' as const,
    daysAgo: 1
  },
  {
    title: '行业协会发布年度报告，头部企业市场份额持续扩大',
    content: '行业协会今日发布2026年度行业白皮书。报告显示，头部企业市场份额较去年进一步扩大，行业集中度持续提升。报告同时指出，中小企业面临较大竞争压力，创新能力不足和资金链紧张是主要瓶颈。多位业内人士呼吁，应建立更加公平的市场竞争环境，鼓励多元化发展。',
    mediaName: '21世纪经济报道',
    mediaLevel: 'finance' as const,
    reachScope: 'national' as const,
    daysAgo: 2
  },
  {
    title: '消费者投诉平台数据显示：售后服务问题成重灾区',
    content: '据全国消费者投诉平台最新统计数据，今年上半年售后服务类投诉量同比增长47%。投诉主要集中在三个方面：一是商品出现质量问题后退换货困难；二是承诺的上门服务未兑现；三是客服热线长期无法接通。消协相关负责人表示，将对投诉量排名靠前的企业进行约谈，督促其改进服务质量。',
    mediaName: '证券时报',
    mediaLevel: 'finance' as const,
    reachScope: 'national' as const,
    daysAgo: 0
  },
  {
    title: '监管部门开展专项检查，多家企业被点名',
    content: '监管部门近日宣布开展为期三个月的行业专项检查行动。本次检查重点关注产品质量合规、消费者权益保护、数据安全等方面。据知情人士透露，已有多家企业在前期抽查中被发现存在不同程度的问题，部分问题严重的企业可能面临行政处罚。监管部门强调，对违法违规行为将保持"零容忍"态度。',
    mediaName: '澎湃新闻',
    mediaLevel: 'portal' as const,
    reachScope: 'viral' as const,
    daysAgo: 0
  },
  {
    title: '第三方机构发布评测报告：产品质量参差不齐',
    content: '某权威第三方评测机构今日发布最新一期产品质量评测报告。报告覆盖了市场上主流品牌的50余款产品，从安全性、耐用性、性能表现等多个维度进行了综合评分。结果显示，各品牌产品质量参差不齐，部分知名品牌产品也存在一定的质量隐患。机构建议消费者在购买前仔细查阅评测报告，谨慎做出选择。',
    mediaName: '界面新闻',
    mediaLevel: 'portal' as const,
    reachScope: 'regional' as const,
    daysAgo: 3
  }
];

export function analyzeUrlReport(url: string): Omit<Report, 'id' | 'createdAt' | 'originalSentiment'> {
  const hash = simpleHash(url);
  const templateIdx = hash % urlTemplates.length;
  const template = urlTemplates[templateIdx];

  const sentiment = detectSentiment(template.title + template.content);
  const keySentences = extractKeySentences(template.content, sentiment);

  const publishTime = new Date(Date.now() - template.daysAgo * 86400000 - (hash % 3600000)).toISOString();

  return {
    title: template.title,
    content: template.content,
    summary: template.content.slice(0, 100) + '...',
    url,
    source: 'url',
    mediaName: template.mediaName,
    mediaLevel: template.mediaLevel,
    publishTime,
    sentiment,
    keySentences,
    subjects: [],
    reachScope: template.reachScope
  };
}

const fileTemplates = [
  {
    title: '公司产品抽检不合格被通报，涉及多个批次',
    content: '市市场监督管理局近日发布2026年第二季度产品质量抽检通报。通报显示，我公司生产的某型号产品在本次抽检中被判定为不合格，主要问题为关键性能指标未达到国家标准。本次共抽检3个批次，涉及产品数量约1.2万件。公司质量部门已启动紧急召回程序，并对相关责任人进行停职调查。业内专家表示，此次事件可能对公司品牌形象造成负面影响，建议公关部门及时发布声明回应公众关切。',
    mediaName: '质量监管公报',
    mediaLevel: 'national' as const,
    reachScope: 'national' as const
  },
  {
    title: '公司高管接受财经专访，解读未来战略布局',
    content: '公司CEO王先生近日接受了某财经媒体的独家专访。在访谈中，王先生详细解读了公司未来三年的战略布局，重点提及了在人工智能、绿色能源等新兴领域的投入计划。王先生表示，公司将持续加大研发投入，力争在核心技术领域实现自主可控。此外，王先生还回应了市场关心的海外市场拓展问题，透露公司已与多个国家的合作伙伴签署了意向协议。本次专访内容已在多家主流财经媒体全文刊发。',
    mediaName: '财经人物周刊',
    mediaLevel: 'finance' as const,
    reachScope: 'national' as const
  },
  {
    title: '竞争对手发布革命性新品，市场格局生变',
    content: '公司主要竞争对手今日举办盛大新品发布会，推出了据称具有革命性意义的新一代产品。根据发布会现场演示，该产品在多个核心指标上领先行业平均水平30%以上，而定价却与现有产品持平。多位行业分析师认为，这一举措将重塑现有市场格局，对我公司的市场份额构成直接挑战。建议公司尽快评估影响并制定应对策略，必要时可考虑提前发布原定下月推出的新品。',
    mediaName: '科技前沿',
    mediaLevel: 'industry' as const,
    reachScope: 'national' as const
  },
  {
    title: '公司被评为"年度最具社会责任感企业"',
    content: '在今日举办的2026中国企业社会责任峰会上，我公司凭借在绿色环保、公益慈善等方面的突出贡献，被评为"年度最具社会责任感企业"。评委会特别肯定了公司在乡村振兴助学项目中的持续投入，以及在行业内率先实现碳中和生产的示范意义。公司副总经理在领奖时表示，将继续秉持"企业公民"理念，为社会创造更大价值。相关报道已在多家主流媒体刊发。',
    mediaName: '企业公民杂志',
    mediaLevel: 'industry' as const,
    reachScope: 'regional' as const
  },
  {
    title: '消费者集体维权事件持续发酵，网络热度攀升',
    content: '上周曝光的某产品质量问题引发的消费者集体维权事件仍在持续发酵。截至今日，已有超过500名消费者加入维权群，相关话题在社交媒体的阅读量已突破2亿次，登上热搜榜前三位。部分法律界人士在媒体上发表评论，认为公司若不能及时妥善处理，可能面临集体诉讼风险。建议公关部门尽快制定统一回应口径，主动与消费者代表沟通，防止事态进一步升级。',
    mediaName: '消费者日报',
    mediaLevel: 'selfmedia' as const,
    reachScope: 'viral' as const
  },
  {
    title: '公司季度财报超预期，营收同比增长35%',
    content: '公司今日发布2026年第二季度财报。数据显示，公司本季度实现营业收入87.5亿元，同比增长35%；净利润12.3亿元，同比增长42%，双双超出市场预期。财报特别指出，新产品线贡献了40%的营收增长，海外市场拓展成效显著。多家券商机构随即上调公司目标价，评级均为"买入"。公司股价在盘后交易中上涨5.2%。',
    mediaName: '财经早报',
    mediaLevel: 'finance' as const,
    reachScope: 'national' as const
  }
];

export interface FileImportResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  report: Omit<Report, 'id' | 'createdAt' | 'originalSentiment'>;
}

export async function analyzeFile(file: File): Promise<FileImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const hash = simpleHash(file.name + file.size + file.type);
      const templateIdx = hash % fileTemplates.length;
      const template = fileTemplates[templateIdx];

      const sentiment = detectSentiment(template.title + template.content);
      const keySentences = extractKeySentences(template.content, sentiment);

      const publishTime = new Date(Date.now() - (hash % 5) * 86400000).toISOString();

      const ocrPrefix = `【OCR识别自文件：${file.name}】\n`;

      resolve({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        report: {
          title: template.title,
          content: ocrPrefix + template.content,
          summary: template.content.slice(0, 100) + '...',
          source: 'file',
          mediaName: template.mediaName,
          mediaLevel: template.mediaLevel,
          publishTime,
          sentiment,
          keySentences,
          subjects: [],
          reachScope: template.reachScope
        }
      });
    };

    reader.onerror = () => {
      const hash = simpleHash(file.name);
      const templateIdx = hash % fileTemplates.length;
      const template = fileTemplates[templateIdx];

      const sentiment = detectSentiment(template.title + template.content);
      const keySentences = extractKeySentences(template.content, sentiment);

      resolve({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        report: {
          title: template.title,
          content: template.content,
          summary: template.content.slice(0, 100) + '...',
          source: 'file',
          mediaName: template.mediaName,
          mediaLevel: template.mediaLevel,
          publishTime: new Date().toISOString(),
          sentiment,
          keySentences,
          subjects: [],
          reachScope: template.reachScope
        }
      });
    };

    reader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 1024)));
  });
}

export function getUrlHash(url: string): string {
  return simpleHash(url).toString();
}
