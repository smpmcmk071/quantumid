import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, Users, UserPlus, Target, LogOut, Menu, X, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TeamBuilder7A_Logo from './components/TeamBuilder7A_Logo';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const u = await base44.auth.me();
      setUser(u);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const navItems = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Teams', page: 'Teams', icon: Users },
    { name: 'Candidates', page: 'Candidates', icon: UserPlus },
    { name: 'Jobs', page: 'JobPostings', icon: Briefcase },
    { name: 'Team Builder', page: 'Analyzer', icon: Target },
    { name: 'Reports', page: 'Reports', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link to={createPageUrl('Dashboard')} className="flex items-center">
            <TeamBuilder7A_Logo size="sm" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(item => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPageName === item.page 
                    ? 'bg-teal-600 text-white' 
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <span className="text-gray-300 text-sm">{user.full_name || user.email}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="lg:hidden bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-4 py-4 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  currentPageName === item.page 
                    ? 'bg-teal-600 text-white' 
                    : 'text-gray-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-400 w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900/90 backdrop-blur-sm border-t border-slate-700 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} TeamBuilder7A - A Product of Threshold7 Analytics. Stay Above the Threshold.
          </p>
        </div>
      </footer>
    </div>
  );
}