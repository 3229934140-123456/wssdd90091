import Sidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-mono">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索报道、事件、联系人..."
                className="w-72 pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-500 focus:border-transparent transition-colors"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-gray-100 rounded-sm font-mono text-xs">晨会 10:00</span>
              <span className="w-px h-4 bg-gray-200" />
              <span>今日导入 <span className="font-mono font-semibold text-navy-700">5</span> 篇</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
