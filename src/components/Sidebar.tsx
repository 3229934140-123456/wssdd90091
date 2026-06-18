import { NavLink, useLocation } from 'react-router-dom';
import { FileUp, BarChart3, ClipboardList, Shield, Bell } from 'lucide-react';

const navItems = [
  { path: '/import', label: '报道导入', icon: FileUp },
  { path: '/analysis', label: '倾向判读', icon: BarChart3 },
  { path: '/dispatch', label: '处置记录', icon: ClipboardList },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-navy-900 min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-navy-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center">
            <Shield className="w-5 h-5 text-navy-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-white font-serif font-bold text-base tracking-wide">舆情研判台</h1>
            <p className="text-navy-500 text-xs font-mono mt-0.5">PR SENTINEL v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3">
        <p className="px-5 py-2 text-xs text-navy-500 uppercase tracking-wider font-medium">工作台</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.path === '/dispatch' && (
                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">4</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-navy-800">
        <div className="bg-navy-800 rounded-sm p-3">
          <div className="flex items-center gap-2 text-navy-100 text-xs mb-2">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>今日预警</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">2</span>
            <span className="text-xs text-navy-500">条紧急舆情</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-sm bg-navy-700 flex items-center justify-center text-navy-100 text-sm font-medium">
            王
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">王公关</p>
            <p className="text-xs text-navy-500">公关部专员</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
