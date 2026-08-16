import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  Zap,
  ShieldCheck,
  Terminal,
  BookOpen,
  PlayCircle,
  Boxes,
  Activity,
} from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';
import { SITE, MODEL } from '@/lib/constants';

const CURL_EXAMPLE = `curl -X POST "${SITE.apiFullUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "blaze-v1",
    "message": "Explain structs in BlazeLang"
  }'`;

const JS_EXAMPLE = `const response = await fetch(
  "${SITE.apiFullUrl}",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "blaze-v1",
      message: "Explain structs in BlazeLang"
    })
  }
);

const data = await response.json();

console.log(data.response);`;

const PYTHON_EXAMPLE = `import requests

response = requests.post(
    "${SITE.apiFullUrl}",
    json={
        "model": "blaze-v1",
        "message": "Explain structs in BlazeLang"
    }
)

print(response.json()["response"])`;

const FEATURES = [
  {
    icon: Zap,
    title: 'Streaming responses',
    desc: 'Server-sent events deliver tokens as they generate, so your users see answers instantly.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by design',
    desc: 'Credentials never reach the browser. The server proxies requests to the Blaze backend.',
  },
  {
    icon: Code2,
    title: 'Developer-first',
    desc: 'A single endpoint, a single model, a clean JSON contract. No SDK required.',
  },
  {
    icon: Terminal,
    title: 'Built-in playground',
    desc: 'Test prompts and stream responses right in the browser without writing code.',
  },
];

const QUICK_LINKS = [
  { to: '/docs', icon: BookOpen, label: 'API Documentation', desc: 'Endpoint, request, response, errors' },
  { to: '/playground', icon: PlayCircle, label: 'Playground', desc: 'Try Blaze v1 live' },
  { to: '/models', icon: Boxes, label: 'Models', desc: 'Available AI models' },
  { to: '/status', icon: Activity, label: 'Status', desc: 'Real-time service health' },
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-base-700 bg-base-850/60 px-4 py-1.5 text-xs font-medium text-gray-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse-dot" />
              {MODEL.name} is live and available
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span className="gradient-text">BLAZE</span> CONSOLE
            </h1>
            <p className="mt-6 text-lg text-gray-400 sm:text-xl">
              {SITE.tagline}
            </p>
            <p className="mt-3 text-base text-gray-500">
              A developer-focused AI API built for the Blaze ecosystem.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/docs" className="btn-primary w-full sm:w-auto">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link to="/playground" className="btn-secondary w-full sm:w-auto">
                Try Blaze v1
              </Link>
              <Link to="/docs" className="btn-ghost w-full sm:w-auto">
                API Documentation
              </Link>
            </div>
          </div>

          {/* Endpoint + model badge */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Endpoint</p>
                  <p className="mt-1 font-mono text-sm text-blaze-400 sm:text-base">
                    POST {SITE.apiFullUrl}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-blaze-500/30 bg-blaze-500/10 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-blaze-500" />
                  <span className="text-sm font-semibold text-blaze-300">{MODEL.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code examples */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="section-heading">Send your first request</h2>
          <p className="mt-3 text-gray-400">A single POST is all it takes. Here it is in three languages.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <CodeBlock code={CURL_EXAMPLE} language="curl" filename="curl" />
          <CodeBlock code={JS_EXAMPLE} language="javascript" filename="fetch.js" />
          <CodeBlock code={PYTHON_EXAMPLE} language="python" filename="request.py" />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="section-heading">Built for developers</h2>
          <p className="mt-3 text-gray-400">Everything you need to integrate AI into the Blaze ecosystem.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition-transform hover:-translate-y-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blaze-500/10 text-blaze-400">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="card group flex items-center gap-4 p-5 transition-all hover:border-blaze-500/40 hover:bg-base-800/60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-800 text-gray-400 transition-colors group-hover:text-blaze-400">
                <link.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{link.label}</p>
                <p className="truncate text-xs text-gray-500">{link.desc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto shrink-0 text-gray-600 transition-colors group-hover:text-blaze-400" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card relative overflow-hidden p-8 text-center sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blaze-500/5 via-transparent to-accent-500/5" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to build with Blaze?</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">
              Start sending requests in minutes. No SDK, no complex setup — just a simple POST.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/playground" className="btn-primary w-full sm:w-auto">
                Open Playground <ArrowRight size={16} />
              </Link>
              <Link to="/docs" className="btn-secondary w-full sm:w-auto">Read the docs</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
