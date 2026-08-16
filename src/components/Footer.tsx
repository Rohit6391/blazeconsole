import { Link } from 'react-router-dom';
import { Flame, Github, Mail } from 'lucide-react';
import { SITE } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-base-700/60 bg-base-950/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blaze-500 to-blaze-700">
                <Flame size={18} className="text-white" />
              </span>
              <span className="text-lg font-bold text-white">{SITE.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-gray-400">{SITE.description}</p>
            <p className="mt-2 text-xs text-gray-500">
              An open project by {SITE.org}.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/docs" className="text-sm text-gray-400 hover:text-blaze-400">Documentation</Link></li>
              <li><Link to="/playground" className="text-sm text-gray-400 hover:text-blaze-400">Playground</Link></li>
              <li><Link to="/models" className="text-sm text-gray-400 hover:text-blaze-400">Models</Link></li>
              <li><Link to="/status" className="text-sm text-gray-400 hover:text-blaze-400">Status</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-blaze-400">
                  <Github size={14} /> GitHub
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.supportEmail}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-blaze-400">
                  <Mail size={14} /> Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-base-700/40 pt-6 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {SITE.org}. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Powered by Blaze v1
          </p>
        </div>
      </div>
    </footer>
  );
}
