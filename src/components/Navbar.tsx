import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Flame, Menu, X, Github } from 'lucide-react';
import { SITE } from '@/lib/constants';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/docs', label: 'Documentation' },
  { to: '/playground', label: 'Playground' },
  { to: '/models', label: 'Models' },
  { to: '/status', label: 'Status' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-base-700/60 bg-base-950/80 backdrop-blur-lg'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blaze-500 to-blaze-700 shadow-lg shadow-blaze-500/20">
            <Flame size={18} className="text-white" />
          </span>
          <span className="text-lg font-bold text-white">{SITE.name}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-blaze-400' : 'text-gray-400 hover:text-gray-100'
                }`
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1.5 rounded-lg border border-base-700 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-base-600 hover:text-white"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 hover:bg-base-800 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="animate-fade-in border-t border-base-700/60 bg-base-950/95 backdrop-blur-lg md:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-base-800 text-blaze-400' : 'text-gray-300 hover:bg-base-800 hover:text-white'
                  }`
                }
                end={link.to === '/'}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-base-800 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
