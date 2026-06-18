import { useState } from 'react';
import { Link, Upload, List, FileUp, Sparkles, Filter, TrendingUp, AlertTriangle, HelpCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import ReportCard from '../components/ReportCard';
import { useSentimentStore } from '../store/sentimentStore';
import { analyzeReport, analyzeUrlReport } from '../utils/analyzer';
import { SENTIMENT_CONFIG } from '../../shared/constants';
import type { SentimentType } from '../../shared/types';

type ImportTab = 'url' | 'file' | 'batch';

const tabs: { key: ImportTab; label: string; icon: typeof Link; desc: string }[] = [
  { key: 'url', label: '链接导入', icon: Link, desc: '粘贴新闻URL，系统自动抓取内容' },
  { key: 'file', label: '剪报上传', icon: Upload, desc: '上传PDF/图片格式的媒体剪报' },
  { key: 'batch', label: '批量录入', icon: List, desc: '批量粘贴标题摘要，每行一条' },
];

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<ImportTab>('url');
  const [urlInput, setUrlInput] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<SentimentType | 'all'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const reports = useSentimentStore(s => s.reports);
  const addReport = useSentimentStore(s => s.addReport);
  const addReports = useSentimentStore(s => s.addReports);

  const sortedReports = [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filteredReports = filterSentiment === 'all' ? sortedReports : sortedReports.filter(r => r.sentiment === filterSentiment);

  const stats = {
    total: reports.length,
    positive: reports.filter(r => r.sentiment === 'positive').length,
    neutral: reports.filter(r => r.sentiment === 'neutral').length,
    doubtful: reports.filter(r => r.sentiment === 'doubtful').length,
    negative: reports.filter(r => r.sentiment === 'negative').length,
    risk: reports.filter(r => r.sentiment === 'risk').length,
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const urls = urlInput.split(/\n+/).filter(u => u.trim());
      const newReports = urls.map(url => analyzeUrlReport(url.trim()));
      addReports(newReports);
      setUrlInput('');
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleBatchImport = async () => {
    if (!batchInput.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const lines = batchInput.split(/\n+/).filter(l => l.trim());
      const newReports = lines.map(line => {
        const [title, ...rest] = line.split('|').map(s => s.trim());
        const content = rest.join('|') || title;
        return analyzeReport(title, content);
      });
      addReports(newReports);
      setBatchInput('');
      setIsAnalyzing(false);
    }, 800);
  };

  const handleFileImport = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const samples = [
        analyzeReport('某公司财报超预期，营收同比增长35%', '根据最新发布的2026年Q2财报，该公司营收同比增长35%，净利润增长42%，均超出市场预期。管理层表示对全年业绩保持乐观态度。', '财经日报'),
        analyzeReport('产品质量问题频发，消费者维权艰难', '近期多位消费者反映购买的产品存在严重质量问题，多次联系售后仍未得到妥善处理。目前已有超过200名消费者加入维权群。', '消费者报道'),
      ];
      addReports(samples);
      setIsAnalyzing(false);
    }, 1500);
  };

  const filterOptions: { key: SentimentType | 'all'; label: string; icon?: typeof Filter }[] = [
    { key: 'all', label: '全部' },
    { key: 'risk', label: '风险提示', icon: ShieldAlert },
    { key: 'negative', label: '负面', icon: AlertTriangle },
    { key: 'doubtful', label: '质疑', icon: HelpCircle },
    { key: 'neutral', label: '中性', icon: Filter },
    { key: 'positive', label: '正面', icon: CheckCircle2 },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">报道导入</h1>
          <p className="text-sm text-gray-500 mt-1">导入媒体报道，系统自动完成倾向初判与关键句标注</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">已导入 {stats.total} 篇 · 今日 +5</span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { label: '正面', value: stats.positive, type: 'positive' as SentimentType, icon: TrendingUp },
          { label: '中性', value: stats.neutral, type: 'neutral' as SentimentType, icon: Filter },
          { label: '质疑', value: stats.doubtful, type: 'doubtful' as SentimentType, icon: HelpCircle },
          { label: '负面', value: stats.negative, type: 'negative' as SentimentType, icon: AlertTriangle },
          { label: '风险提示', value: stats.risk, type: 'risk' as SentimentType, icon: ShieldAlert },
          { label: '待修正', value: reports.filter(r => r.sentiment === r.originalSentiment && r.subjects.length === 0).length, type: 'neutral' as SentimentType, icon: Sparkles, highlight: true },
        ].map((item, idx) => {
          const config = SENTIMENT_CONFIG[item.type];
          const Icon = item.icon;
          return (
            <div key={idx} className={`card p-3 ${item.highlight ? 'border-amber-300 bg-amber-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">{item.label}</span>
                <Icon className="w-3.5 h-3.5" style={{ color: config.color }} strokeWidth={1.8} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-bold" style={{ color: config.color }}>{item.value}</span>
                <span className="text-xs text-gray-400">篇</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5">
          <div className="card overflow-hidden">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${active ? 'text-navy-700 bg-white border-b-2 border-navy-700' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border-b border-transparent'}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="w-4 h-4" strokeWidth={1.8} />
                      {tab.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                {tabs.find(t => t.key === activeTab)?.desc}
              </p>

              {activeTab === 'url' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">新闻链接</label>
                  <textarea
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="粘贴新闻URL，支持一行一条批量导入..."
                    rows={5}
                    className="textarea-field font-mono text-xs"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {urlInput ? `已输入 ${urlInput.split(/\n+/).filter(u => u.trim()).length} 条链接` : '示例：https://example.com/news/xxx'}
                    </p>
                    <button
                      onClick={handleUrlImport}
                      disabled={!urlInput.trim() || isAnalyzing}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" strokeWidth={1.8} />
                      {isAnalyzing ? '分析中...' : '智能分析导入'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'file' && (
                <div>
                  <div
                    onClick={handleFileImport}
                    className="border-2 border-dashed border-gray-200 rounded-sm p-8 text-center cursor-pointer hover:border-navy-400 hover:bg-navy-50/30 transition-colors"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileUp className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">点击选择文件或拖拽至此处</p>
                    <p className="text-xs text-gray-400">支持 PDF、JPG、PNG 格式，单个文件不超过 10MB</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleFileImport}
                      disabled={isAnalyzing}
                      className="btn-primary disabled:opacity-50"
                    >
                      {isAnalyzing ? 'OCR识别分析中...' : '模拟导入示例剪报'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'batch' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">标题与摘要</label>
                  <textarea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder={'每行一条，格式：标题|摘要内容\n示例：某公司发布新产品|该产品将于下月正式上市，售价2999元起'}
                    rows={7}
                    className="textarea-field font-mono text-xs"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {batchInput ? `已输入 ${batchInput.split(/\n+/).filter(l => l.trim()).length} 条记录` : '标题和摘要用 | 分隔，也可只输入标题'}
                    </p>
                    <button
                      onClick={handleBatchImport}
                      disabled={!batchInput.trim() || isAnalyzing}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" strokeWidth={1.8} />
                      {isAnalyzing ? '分析中...' : '批量分析导入'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span>初判结果列表</span>
              <span className="text-xs text-gray-400 font-normal">({filteredReports.length} 篇)</span>
            </h2>
            <div className="flex items-center gap-1">
              {filterOptions.map(opt => {
                const active = filterSentiment === opt.key;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setFilterSentiment(opt.key)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${active ? 'bg-navy-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {Icon && <Icon className="w-3 h-3" strokeWidth={1.8} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
            {filteredReports.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <Filter className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无匹配的报道</p>
              </div>
            ) : (
              filteredReports.map((report, idx) => (
                <ReportCard key={report.id} report={report} index={idx} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
