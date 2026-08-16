import { Boxes, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MODEL } from '@/lib/constants';

export default function Models() {
  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <Boxes size={28} className="text-blaze-400" />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Models</h1>
        </div>
        <p className="mt-2 max-w-2xl text-gray-400">
          The models publicly available through the BlazeConsole API.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="card overflow-hidden p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blaze-500 to-blaze-700 shadow-lg shadow-blaze-500/20">
                <Boxes size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{MODEL.name}</h2>
                <p className="mt-0.5 font-mono text-sm text-gray-400">{MODEL.id}</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-success-500/30 bg-success-500/10 px-3 py-1 text-xs font-medium text-success-400">
              <CheckCircle2 size={14} />
              {MODEL.status}
            </span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-gray-300">{MODEL.description}</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-base-700 bg-base-900/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Identifier</dt>
              <dd className="mt-1 font-mono text-sm text-blaze-300">{MODEL.id}</dd>
            </div>
            <div className="rounded-lg border border-base-700 bg-base-900/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Max output</dt>
              <dd className="mt-1 font-mono text-sm text-gray-200">{MODEL.contextWindow}</dd>
            </div>
            <div className="rounded-lg border border-base-700 bg-base-900/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Streaming</dt>
              <dd className="mt-1 text-sm text-gray-200">Supported (text/event-stream)</dd>
            </div>
            <div className="rounded-lg border border-base-700 bg-base-900/50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Auth</dt>
              <dd className="mt-1 text-sm text-gray-200">Server-side (none in browser)</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/playground" className="btn-primary">Try {MODEL.name}</Link>
            <Link to="/docs" className="btn-secondary">View documentation</Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          BlazeConsole currently exposes a single public model. The underlying implementation is private infrastructure.
        </p>
      </div>
    </div>
  );
}
