import type { Report, MediaEvent, Contact, DispatchRecord } from './types';

export const mockReports: Report[] = [
  {
    id: 'r1',
    title: '某科技公司发布新一代AI芯片，性能提升300%',
    summary: '该公司今日在年度技术峰会上正式发布自研新一代AI处理芯片，官方数据显示算力较上一代产品提升300%，能效比提升50%。',
    content: '6月15日，某科技公司在北京国家会议中心举办年度技术峰会，创始人兼CEO张某某亲自发布了公司自研的新一代AI处理芯片"星辰三代"。据官方介绍，该芯片采用3nm工艺制程，在标准测试中FP16算力达到1280TFLOPS，较上一代"星辰二代"提升300%，能效比提升50%。多位业内分析师在接受采访时表示，这一性能指标已处于国际第一梯队水平。不过也有质疑声音指出，实际应用场景中的表现仍需时间检验。',
    url: 'https://example.com/news/ai-chip-launch',
    source: 'url',
    mediaName: '财经日报',
    mediaLevel: 'finance',
    publishTime: '2026-06-15T09:30:00Z',
    sentiment: 'positive',
    originalSentiment: 'positive',
    keySentences: [
      { id: 'ks1', text: '性能较上一代产品提升300%，能效比提升50%', reason: '明确的性能提升正面描述', position: 45 },
      { id: 'ks2', text: '处于国际第一梯队水平', reason: '行业地位肯定', position: 280 }
    ],
    subjects: ['公司品牌', 'CEO张某某'],
    reachScope: 'national',
    eventId: 'e1',
    createdAt: '2026-06-15T09:35:00Z',
    voiceType: 'media'
  },
  {
    id: 'r2',
    title: '芯片实测数据存疑？第三方实验室提出不同结论',
    summary: '某独立测试实验室昨日发布报告，称该公司新发布的AI芯片在实际负载下性能仅达到宣传值的65%左右，引发业内关注。',
    content: '继某科技公司高调发布"星辰三代"AI芯片后，昨日晚间，总部位于上海的某独立第三方实验室发布了一份测试报告，指出该芯片在典型AI训练负载下的实际性能仅为官方宣传值的65%左右。报告同时指出，芯片在高负载运行下温度控制存在问题，可能触发降频保护。受此消息影响，该公司美股盘前交易下跌4.2%。截至发稿，公司方面尚未作出正式回应。',
    url: 'https://example.com/news/chip-performance-doubt',
    source: 'url',
    mediaName: '21世纪经济报道',
    mediaLevel: 'finance',
    publishTime: '2026-06-16T20:15:00Z',
    sentiment: 'doubtful',
    originalSentiment: 'doubtful',
    keySentences: [
      { id: 'ks3', text: '实际性能仅为官方宣传值的65%左右', reason: '质疑宣传数据真实性', position: 120 },
      { id: 'ks4', text: '高负载运行下温度控制存在问题', reason: '指出产品缺陷', position: 200 },
      { id: 'ks5', text: '公司方面尚未作出正式回应', reason: '暗示应对迟缓', position: 320 }
    ],
    subjects: ['公司品牌', '产品质量'],
    reachScope: 'national',
    eventId: 'e1',
    createdAt: '2026-06-16T20:20:00Z',
    voiceType: 'expert'
  },
  {
    id: 'r3',
    title: '证监会问询：新芯片性能披露是否合规',
    summary: '证监会今日向该公司发出问询函，要求就媒体报道中涉及的芯片性能数据差异作出说明，并核实相关信息披露是否符合上市规则。',
    content: '6月17日上午，证监会官方网站披露信息显示，已向某科技公司发出《上市公司监管问询函》，要求公司就近期媒体报道中涉及的新一代AI芯片性能数据差异问题作出书面说明。问询函特别指出，公司需核实此前公开披露的性能数据是否客观、准确，信息披露是否符合《上市公司信息披露管理办法》的相关规定。业内律师表示，若查证存在夸大宣传情形，公司可能面临行政处罚及投资者集体诉讼风险。',
    url: 'https://example.com/news/csrc-inquiry',
    source: 'url',
    mediaName: '证券时报',
    mediaLevel: 'national',
    publishTime: '2026-06-17T10:05:00Z',
    sentiment: 'risk',
    originalSentiment: 'risk',
    keySentences: [
      { id: 'ks6', text: '证监会发出问询函', reason: '监管介入，高风险信号', position: 50 },
      { id: 'ks7', text: '可能面临行政处罚及投资者集体诉讼风险', reason: '明确的法律和财务风险提示', position: 350 }
    ],
    subjects: ['公司品牌', '监管风险', '法律风险'],
    reachScope: 'viral',
    eventId: 'e1',
    createdAt: '2026-06-17T10:10:00Z',
    voiceType: 'regulator'
  },
  {
    id: 'r4',
    title: '消费者投诉激增：某电商平台"618"促销被指虚假宣传',
    summary: '黑猫投诉平台数据显示，今年"618"期间针对该电商平台的投诉量同比增长180%，主要涉及先涨后降、虚假发货等问题。',
    content: '据黑猫投诉平台近日发布的"618"消费维权报告显示，今年6月1日至18日期间，针对某头部电商平台的投诉量达12,847件，同比激增180%。投诉内容主要集中在三个方面：一是"先涨后降"的虚假促销行为，有消费者反映某款手机节前标价2999元，促销期间标价涨至3499元后再"打8折"，实际售价反而更高；二是虚假发货，部分用户表示下单超过72小时仍未显示物流信息；三是优惠券使用限制未明确标注。中国消费者协会相关负责人在接受采访时表示，已关注到相关投诉，将敦促平台自查整改。',
    url: 'https://example.com/news/ecommerce-complaints',
    source: 'url',
    mediaName: '消费者报道',
    mediaLevel: 'industry',
    publishTime: '2026-06-19T08:00:00Z',
    sentiment: 'negative',
    originalSentiment: 'negative',
    keySentences: [
      { id: 'ks8', text: '投诉量达12,847件，同比激增180%', reason: '大量消费者投诉数据', position: 80 },
      { id: 'ks9', text: '"先涨后降"的虚假促销行为', reason: '具体指控不诚信经营', position: 150 },
      { id: 'ks10', text: '中国消费者协会将敦促平台自查整改', reason: '监管机构介入', position: 380 }
    ],
    subjects: ['公司品牌', '消费者关系'],
    reachScope: 'national',
    eventId: 'e2',
    createdAt: '2026-06-19T08:05:00Z',
    voiceType: 'consumer'
  },
  {
    id: 'r5',
    title: '电商平台回应"618"投诉：系统问题导致价格显示异常',
    summary: '该电商平台昨日晚间发布官方声明，称部分商品价格显示异常系系统缓存问题所致，已对受影响用户进行补偿。',
    content: '针对近日媒体和消费者集中反映的"618"促销问题，某电商平台于昨晚22时通过官方微博发布声明回应。声明称，经查，部分商品出现的价格显示异常系大促期间系统缓存更新延迟所致，并非故意"先涨后降"。平台表示，已对所有受影响用户进行差价补偿，单笔最高补偿金额达500元，同时对优惠券使用规则的展示页面进行了优化。不过，声明中并未对虚假发货问题作出具体回应。',
    url: 'https://example.com/news/ecommerce-response',
    source: 'url',
    mediaName: '澎湃新闻',
    mediaLevel: 'portal',
    publishTime: '2026-06-19T07:30:00Z',
    sentiment: 'neutral',
    originalSentiment: 'neutral',
    keySentences: [
      { id: 'ks11', text: '并非故意"先涨后降"', reason: '官方否认指控', position: 180 },
      { id: 'ks12', text: '未对虚假发货问题作出具体回应', reason: '回应不完整，留有疑问', position: 350 }
    ],
    subjects: ['公司品牌'],
    reachScope: 'national',
    eventId: 'e2',
    createdAt: '2026-06-19T07:35:00Z',
    voiceType: 'official'
  },
  {
    id: 'r6',
    title: '某餐饮连锁被曝使用过期食材，涉及全国20余家门店',
    summary: '有媒体卧底调查发现，该品牌多家门店存在篡改食材保质期标签、使用过期肉类和蔬菜等问题。',
    content: '某知名财经媒体今日发布深度调查报道，经过为期两周的卧底调查，发现某头部餐饮连锁品牌在全国多个城市的20余家门店存在严重的食品安全问题。具体包括：篡改已过期肉类和蔬菜食材的保质期标签、使用隔夜已发酸的半成品、后厨员工未按规定佩戴口罩和手套等。视频画面显示，部分食材表面已出现明显霉斑仍被继续加工使用。报道发出后，微博话题#某餐饮食品安全问题#在一小时内阅读量突破2亿，登上热搜榜第一位。目前，多地市场监管部门已表示将介入调查。',
    url: 'https://example.com/news/food-safety-scandal',
    source: 'url',
    mediaName: '财经网',
    mediaLevel: 'finance',
    publishTime: '2026-06-18T06:00:00Z',
    sentiment: 'negative',
    originalSentiment: 'negative',
    keySentences: [
      { id: 'ks13', text: '使用过期肉类和蔬菜食材', reason: '严重食品安全违规', position: 80 },
      { id: 'ks14', text: '20余家门店存在严重的食品安全问题', reason: '涉及范围广', position: 60 },
      { id: 'ks15', text: '话题阅读量突破2亿，登上热搜榜第一位', reason: '传播范围极广，舆情热度高', position: 300 },
      { id: 'ks16', text: '多地市场监管部门已介入调查', reason: '监管介入，存在处罚风险', position: 380 }
    ],
    subjects: ['公司品牌', '产品质量', '食品安全', '高管责任'],
    reachScope: 'viral',
    eventId: 'e3',
    createdAt: '2026-06-18T06:05:00Z',
    voiceType: 'media'
  },
  {
    id: 'r7',
    title: '餐饮品牌CEO致歉：全员停岗培训，全面整改',
    summary: '事件曝光12小时后，该品牌CEO通过个人微博发布致歉视频，承诺全面整改并接受社会监督。',
    content: '昨晚18时许，某餐饮连锁品牌CEO李某某通过其个人认证微博发布了时长3分20秒的致歉视频，对媒体曝光的食品安全问题向广大消费者致以最诚挚的歉意。李某某在视频中宣布：即日起涉事门店全部停业整顿，全国所有门店进行为期一周的全员食品安全培训；公司将邀请第三方机构对全国门店进行飞检，检查结果实时向社会公开；同时对此次事件中负有管理责任的区域经理和店长一律予以解聘。视频发布后，相关话题下的评论呈现两极分化，部分网友认可认错态度，也有网友质疑"道歉来得快，平时监管去哪儿了"。',
    url: 'https://example.com/news/restaurant-ceo-apology',
    source: 'url',
    mediaName: '腾讯新闻',
    mediaLevel: 'portal',
    publishTime: '2026-06-18T18:15:00Z',
    sentiment: 'neutral',
    originalSentiment: 'neutral',
    keySentences: [
      { id: 'ks17', text: '向广大消费者致以最诚挚的歉意', reason: '官方认错表态', position: 100 },
      { id: 'ks18', text: '涉事门店全部停业整顿，全员食品安全培训', reason: '具体整改措施', position: 160 },
      { id: 'ks19', text: '评论呈现两极分化', reason: '公众态度分化，舆情仍未平息', position: 350 }
    ],
    subjects: ['公司品牌', 'CEO李某某'],
    reachScope: 'viral',
    eventId: 'e3',
    createdAt: '2026-06-18T18:20:00Z',
    voiceType: 'official'
  },
  {
    id: 'r8',
    title: '某新能源汽车宣布全系车型降价3-5万元',
    summary: '该公司今日宣布，为庆祝累计销量突破200万辆，旗下全系车型限时降价3-5万元，引发消费者热议。',
    content: '今日上午，某新能源汽车品牌通过官方渠道宣布启动"感恩200万用户"限时优惠活动，旗下全系车型价格下调3-5万元不等，降价后入门款车型售价跌破20万元大关。公司销售总裁在发布会上表示，此次降价是对用户长期支持的回馈，不存在清库存或应对竞争的考虑。但据多位经销商透露，该品牌近两个月库存周转天数已从28天升至45天，存在一定去库存压力。降价消息公布后，不少已提车车主在社交平台表达不满，认为车企"割韭菜"。',
    source: 'manual',
    mediaName: '汽车之家',
    mediaLevel: 'industry',
    publishTime: '2026-06-17T11:00:00Z',
    sentiment: 'neutral',
    originalSentiment: 'neutral',
    keySentences: [
      { id: 'ks20', text: '全系车型价格下调3-5万元不等', reason: '重大商业动作，可能影响品牌定位', position: 60 },
      { id: 'ks21', text: '库存周转天数已从28天升至45天', reason: '暗示存在销售压力', position: 260 },
      { id: 'ks22', text: '已提车车主表达不满', reason: '可能引发老用户舆情', position: 340 }
    ],
    subjects: ['公司品牌', '产品定价'],
    reachScope: 'regional',
    eventId: 'e4',
    createdAt: '2026-06-17T11:05:00Z',
    voiceType: 'media'
  },
  {
    id: 'r9',
    title: '车主集体维权：新能源车企被指价格歧视',
    summary: '降价消息公布3天后，全国多地出现车主自发组织的维权活动，要求车企给出补偿方案。',
    content: '距某新能源车企宣布全系降价仅过去3天，全国已有17个城市出现车主自发组织的维权活动。维权车主多为降价前1个月内购车的用户，部分车主称提车仅3天就遭遇大幅降价，损失达数万元。在某一线城市的品牌直营门店外，数十名车主举着"还我血汗钱""价格欺诈"的标语进行抗议。有法律界人士指出，若车企在降价前已知悉相关计划却未告知消费者，或涉嫌侵犯消费者知情权。截至目前，车企官方未对维权事件作出任何回应。',
    source: 'manual',
    mediaName: '界面新闻',
    mediaLevel: 'finance',
    publishTime: '2026-06-19T09:30:00Z',
    sentiment: 'negative',
    originalSentiment: 'negative',
    keySentences: [
      { id: 'ks23', text: '17个城市出现车主自发组织的维权活动', reason: '大规模消费者抗议', position: 60 },
      { id: 'ks24', text: '举着"还我血汗钱""价格欺诈"的标语', reason: '情绪激烈的负面舆论', position: 200 },
      { id: 'ks25', text: '涉嫌侵犯消费者知情权', reason: '法律风险提示', position: 300 },
      { id: 'ks26', text: '车企官方未作出任何回应', reason: '应对沉默，可能加剧舆情', position: 380 }
    ],
    subjects: ['公司品牌', '消费者关系', '法律风险'],
    reachScope: 'national',
    eventId: 'e4',
    createdAt: '2026-06-19T09:35:00Z',
    voiceType: 'consumer'
  },
  {
    id: 'r10',
    title: '公司获评年度最佳雇主，员工满意度创新高',
    summary: '某权威人力资源咨询机构发布2026年度最佳雇主榜单，该公司连续第三年入选并跃升至前五名。',
    content: '近日，某国际知名人力资源咨询机构发布了"2026年度中国最佳雇主百强"榜单，某科技公司连续第三年入选，排名从去年的第12位跃升至第5位，创历史最好成绩。报告显示，该公司员工整体满意度达92.3%，较去年提升4.1个百分点，在工作环境、薪酬福利和职业发展三个维度上均获高分。公司人力资源副总裁在接受采访时表示，这一成绩是对公司长期坚持"以人为本"理念的最好肯定。',
    source: 'manual',
    mediaName: 'HR观察',
    mediaLevel: 'industry',
    publishTime: '2026-06-14T14:00:00Z',
    sentiment: 'positive',
    originalSentiment: 'positive',
    keySentences: [
      { id: 'ks27', text: '连续第三年入选，排名跃升至第5位', reason: '雇主品牌持续提升', position: 80 },
      { id: 'ks28', text: '员工整体满意度达92.3%', reason: '内部正面评价', position: 160 }
    ],
    subjects: ['公司品牌', '雇主品牌'],
    reachScope: 'local',
    eventId: 'e5',
    createdAt: '2026-06-14T14:05:00Z',
    voiceType: 'expert'
  },
  {
    id: 'r11',
    title: '深度复盘：从芯片发布到监管问询的48小时',
    summary: '本文梳理了某科技公司新芯片从高调发布到被第三方质疑，再到证监会发函问询的完整舆论时间线。',
    content: '6月15日上午，某科技公司CEO张某某在万众瞩目中发布了新一代AI芯片。当天的舆论以正面为主，多家财经媒体给予积极评价。然而风云突变，16日晚间某第三方实验室发布的实测报告将芯片性能推上风口浪尖，舆论迅速转向质疑。17日早间，证监会的问询函更是将事件推向高潮。值得注意的是，从始至终，公司除了发布会上的正面宣传外，未对任何质疑作出回应，公关层面的沉默被业内认为加速了舆情发酵。有危机公关专家指出，黄金24小时应对窗口的错失是此次舆情升级的关键原因。',
    source: 'manual',
    mediaName: '公关世界',
    mediaLevel: 'industry',
    publishTime: '2026-06-18T16:00:00Z',
    sentiment: 'doubtful',
    originalSentiment: 'doubtful',
    keySentences: [
      { id: 'ks29', text: '舆论迅速转向质疑', reason: '态度变化明确标注', position: 150 },
      { id: 'ks30', text: '未对任何质疑作出回应', reason: '批评公关应对缺失', position: 260 },
      { id: 'ks31', text: '黄金24小时应对窗口的错失', reason: '专家指出应对失误', position: 340 }
    ],
    subjects: ['公司品牌', '公关应对', 'CEO张某某'],
    reachScope: 'national',
    eventId: 'e1',
    createdAt: '2026-06-18T16:05:00Z',
    voiceType: 'expert'
  },
  {
    id: 'r12',
    title: '某自媒体：餐饮行业还有多少"看不见的厨房"',
    summary: '某头部微信公众号发表评论文章，指出此次食品安全事件暴露的是整个行业的深层问题。',
    content: '针对近期某餐饮品牌曝出的食品安全丑闻，某头部微信公众号今日推送深度评论文章指出，这不是单一品牌的问题，而是整个餐饮行业的系统性病灶。文章列举了近三年被曝光的17起类似事件，认为在快速扩张和成本控制的压力下，食品安全标准被层层妥协。文章还批评了监管部门日常检查的形式化倾向，建议引入"神秘顾客"式的常态化暗访机制。该文章发布6小时内阅读量突破10万+，在看数超过8000。',
    source: 'manual',
    mediaName: '餐饮行业观察',
    mediaLevel: 'selfmedia',
    publishTime: '2026-06-19T10:00:00Z',
    sentiment: 'negative',
    originalSentiment: 'negative',
    keySentences: [
      { id: 'ks32', text: '整个餐饮行业的系统性病灶', reason: '将个案上升为行业问题', position: 100 },
      { id: 'ks33', text: '食品安全标准被层层妥协', reason: '强烈批评行业生态', position: 180 },
      { id: 'ks34', text: '阅读量突破10万+', reason: '传播范围广', position: 380 }
    ],
    subjects: ['公司品牌', '行业声誉'],
    reachScope: 'national',
    eventId: 'e3',
    createdAt: '2026-06-19T10:05:00Z',
    voiceType: 'media'
  }
];

export const mockEvents: MediaEvent[] = [
  {
    id: 'e1',
    name: '新AI芯片性能数据争议事件',
    reports: ['r1', 'r2', 'r3', 'r11'],
    firstReportTime: '2026-06-15T09:30:00Z',
    latestReportTime: '2026-06-18T16:00:00Z',
    sentimentShift: true,
    priority: 'critical',
    description: '公司发布新AI芯片后被第三方实验室质疑性能数据，随后证监会介入问询，舆情从正面迅速转为高风险',
    escalationReasons: ['存在监管/法律风险报道', '多条负面/风险报道']
  },
  {
    id: 'e2',
    name: '"618"促销虚假宣传投诉事件',
    reports: ['r4', 'r5'],
    firstReportTime: '2026-06-19T07:30:00Z',
    latestReportTime: '2026-06-19T08:00:00Z',
    sentimentShift: false,
    priority: 'high',
    description: '"618"大促期间消费者集中投诉虚假宣传，官方回应被指不完整',
    escalationReasons: ['多条负面/风险报道']
  },
  {
    id: 'e3',
    name: '餐饮品牌食品安全丑闻',
    reports: ['r6', 'r7', 'r12'],
    firstReportTime: '2026-06-18T06:00:00Z',
    latestReportTime: '2026-06-19T10:00:00Z',
    sentimentShift: false,
    priority: 'critical',
    description: '多家门店被曝使用过期食材，CEO发布致歉视频但舆情仍在持续发酵',
    escalationReasons: ['负面/风险报道占比超50%', '多条负面/风险报道']
  },
  {
    id: 'e4',
    name: '新能源车型降价引发车主维权',
    reports: ['r8', 'r9'],
    firstReportTime: '2026-06-17T11:00:00Z',
    latestReportTime: '2026-06-19T09:30:00Z',
    sentimentShift: true,
    priority: 'high',
    description: '全系降价3-5万引发老车主集体抗议，车企应对沉默导致舆情升级',
    escalationReasons: ['多条负面/风险报道']
  },
  {
    id: 'e5',
    name: '获评年度最佳雇主',
    reports: ['r10'],
    firstReportTime: '2026-06-14T14:00:00Z',
    latestReportTime: '2026-06-14T14:00:00Z',
    sentimentShift: false,
    priority: 'low',
    description: '正面舆情事件，可用于品牌传播',
    escalationReasons: []
  }
];

export const mockContacts: Contact[] = [
  {
    id: 'c1',
    name: '王志远',
    media: '财经日报',
    title: '资深科技记者',
    phone: '138****1234',
    email: 'wang.zy@cjdaily.com',
    relationship: 'friendly',
    lastContact: '2026-06-10'
  },
  {
    id: 'c2',
    name: '刘芳',
    media: '21世纪经济报道',
    title: '资本市场部副主任',
    phone: '139****5678',
    email: 'liufang@21jingji.com',
    relationship: 'neutral',
    lastContact: '2026-06-15'
  },
  {
    id: 'c3',
    name: '张磊',
    media: '证券时报',
    title: '监管新闻记者',
    phone: '137****9012',
    email: 'zhanglei@stcn.com',
    relationship: 'difficult',
    lastContact: '2026-05-20'
  },
  {
    id: 'c4',
    name: '陈明',
    media: '澎湃新闻',
    title: '消费频道主编',
    phone: '136****3456',
    email: 'chenming@thepaper.cn',
    relationship: 'friendly',
    lastContact: '2026-06-18'
  },
  {
    id: 'c5',
    name: '林小美',
    media: '消费者报道',
    title: '主笔',
    phone: '135****7890',
    email: 'linxm@xfzb.com',
    relationship: 'neutral',
    lastContact: '2026-06-12'
  },
  {
    id: 'c6',
    name: '赵东',
    media: '财经网',
    title: '调查记者',
    phone: '134****2345',
    email: 'zhaodong@caijing.com',
    relationship: 'difficult',
    lastContact: '2026-04-28'
  },
  {
    id: 'c7',
    name: '黄晓芸',
    media: '腾讯新闻',
    title: '商业频道副主编',
    phone: '133****6789',
    email: 'huangxy@tencent.com',
    relationship: 'friendly',
    lastContact: '2026-06-16'
  },
  {
    id: 'c8',
    name: '周伟',
    media: '界面新闻',
    title: '汽车频道记者',
    phone: '132****0123',
    email: 'zhouwei@jiemian.com',
    relationship: 'neutral',
    lastContact: '2026-06-08'
  }
];

export const mockDispatches: DispatchRecord[] = [
  {
    id: 'd1',
    eventId: 'e3',
    status: 'responding',
    statement: '针对媒体报道的食品安全问题，公司高度重视，第一时间成立专项调查组。涉事门店已全部停业整顿，全国门店启动食品安全自查。我们向消费者致以诚挚歉意，并将以实际行动重建信任。详细整改方案将于明日上午对外公布。',
    contacts: ['c4', 'c6', 'c7'],
    interviewContacts: [
      { contactId: 'c4', isInterviewTarget: true, commStatus: 'contacted', note: '已约访，待回复' },
      { contactId: 'c6', isInterviewTarget: true, commStatus: 'pending', note: '' },
      { contactId: 'c7', isInterviewTarget: false, commStatus: 'responded', note: '已沟通，态度友好' }
    ],
    followUpNotes: [
      { id: 'fn1', content: '18日晚CEO已发布致歉视频，已同步所有合作媒体', createdAt: '2026-06-18T19:00:00Z' },
      { id: 'fn2', content: '已联系食药监部门，配合调查', createdAt: '2026-06-19T08:00:00Z' },
      { id: 'fn3', content: '今日下午14:00召开媒体沟通会（线上）', createdAt: '2026-06-19T09:30:00Z' }
    ],
    escalationLevel: 'director',
    createdAt: '2026-06-18T06:30:00Z',
    updatedAt: '2026-06-19T09:30:00Z',
    needStatement: true,
    needInterview: true,
    needEscalation: true
  },
  {
    id: 'd2',
    eventId: 'e1',
    status: 'pending',
    statement: '',
    contacts: ['c1', 'c2', 'c3'],
    interviewContacts: [
      { contactId: 'c1', isInterviewTarget: true, commStatus: 'contacted', note: '' },
      { contactId: 'c2', isInterviewTarget: false, commStatus: 'pending', note: '' },
      { contactId: 'c3', isInterviewTarget: true, commStatus: 'pending', note: '难沟通，需谨慎' }
    ],
    followUpNotes: [
      { id: 'fn4', content: '建议法律部先行评估证监会问询函内容', createdAt: '2026-06-17T11:00:00Z' },
      { id: 'fn5', content: '技术部准备芯片实测数据及第三方机构合作方案', createdAt: '2026-06-17T12:30:00Z' }
    ],
    escalationLevel: 'executive',
    createdAt: '2026-06-17T10:30:00Z',
    updatedAt: '2026-06-17T12:30:00Z',
    needStatement: true,
    needInterview: true,
    needEscalation: true
  },
  {
    id: 'd3',
    eventId: 'e2',
    status: 'pending',
    statement: '公司已注意到相关投诉，正在进行系统排查。对部分商品因系统缓存导致的价格显示异常，我们已对受影响用户进行差价补偿，同时优化了优惠券展示规则。其他问题正在核实中。',
    contacts: ['c4', 'c5'],
    interviewContacts: [
      { contactId: 'c4', isInterviewTarget: false, commStatus: 'responded', note: '' },
      { contactId: 'c5', isInterviewTarget: true, commStatus: 'pending', note: '' }
    ],
    followUpNotes: [
      { id: 'fn6', content: '客服团队已准备统一话术', createdAt: '2026-06-19T08:30:00Z' }
    ],
    escalationLevel: 'manager',
    createdAt: '2026-06-19T08:00:00Z',
    updatedAt: '2026-06-19T08:30:00Z',
    needStatement: true,
    needInterview: false,
    needEscalation: false
  },
  {
    id: 'd4',
    eventId: 'e4',
    status: 'pending',
    statement: '',
    contacts: ['c8'],
    interviewContacts: [
      { contactId: 'c8', isInterviewTarget: true, commStatus: 'pending', note: '' }
    ],
    followUpNotes: [
      { id: 'fn7', content: '销售部与法务部评估车主补偿方案可行性', createdAt: '2026-06-19T10:00:00Z' },
      { id: 'fn8', content: '监控社交媒体舆情走向，每小时更新一次', createdAt: '2026-06-19T10:15:00Z' }
    ],
    escalationLevel: 'director',
    createdAt: '2026-06-19T09:45:00Z',
    updatedAt: '2026-06-19T10:15:00Z',
    needStatement: true,
    needInterview: false,
    needEscalation: true
  },
  {
    id: 'd5',
    eventId: 'e5',
    status: 'closed',
    statement: '',
    contacts: [],
    interviewContacts: [],
    followUpNotes: [
      { id: 'fn9', content: '已转发至品牌传播部，用于官方自媒体和招聘宣传', createdAt: '2026-06-14T15:00:00Z' }
    ],
    escalationLevel: 'normal',
    createdAt: '2026-06-14T14:30:00Z',
    updatedAt: '2026-06-14T15:00:00Z',
    needStatement: false,
    needInterview: false,
    needEscalation: false
  }
];
