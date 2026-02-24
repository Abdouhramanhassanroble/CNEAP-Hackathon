import { Link, useLocation } from 'react-router-dom';
import { Sprout } from 'lucide-react';

const navItems = [
  { label: 'Accueil', path: '/' },
  { label: 'Territoire', path: '/territoire' },
  { label: 'Établissements', path: '/etablissements' },
  { label: 'Projections', path: '/projections' },
  { label: 'Paramètres', path: '/parametres' },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <Sprout size={18} className="text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                CNEAP
              </span>
              <span className="block text-[10px] text-muted-foreground font-light tracking-wider uppercase">
                Pays de la Loire
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2025 CNEAP — Observatoire Prospectif</span>
          <span>Données : INSEE, SAFRAN, ONISEP, CNEAP interne</span>
        </div>
      </footer>
    </div>
  );
};
