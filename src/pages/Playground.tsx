import { Link } from 'react-router-dom';
import { Play, Send, Square, AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import CodeBlock from '@/components/CodeBlock';
import { MODEL, SITE } from '@/lib/constants';
import { readSseStream } from '@/lib/stream';

type Status = 'idle' | 'loading' | 'streaming' | 'completed' | 'error' | 'empty';

const SAMPLE_PROMPTS = [
  'Explain structs in BlazeLang',
  'Write a Python function to check if a number is prime',
  'What is ShortCodeGuy Studio?',
  'Explain async/await in JavaScript',
];

const RESPONSE_EXAMPLE = `{
  "model": "blaze-v1",
  "response": "Hello! How can I help?"
}`;

export default function Playground() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || status === 'loading' || status === 'streaming') return;

    setStatus('loading');
    setResponse('');
    setError('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(SITE.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL.id, message: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        const msg = body?.error?.message ?? 'Request failed. Please try again.';
        setError(msg);
        setStatus('error');
        return;
      }

      const contentType = res.headers.get('content-type') ?? '';

      if (contentType.includes('text/event-stream') && res.body) {
        setStatus('streaming');
        await readSseStream(
          res.body,
          (delta) => setResponse((prev) => prev + delta),
          controller.signal,
        );
        setStatus((prev) => (prev === 'streaming' ? 'completed' : prev));
      } else {
        const data = (await res.json().catch(() => null)) as { response?: string; error?: { message?: string } } | null;
        if (data?.error) {
          setError(data.error.message ?? 'Unknown error');
          setStatus('error');
        } else {
          setResponse(data?.response ?? '');
          setStatus(data?.response ? 'completed' : 'empty');
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('completed');
      } else {
        setError('Network error. Check your connection and try again.');
        setStatus('error');
      }
    } finally {
      abortRef.current = null;
    }
  }, [prompt, status]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setPrompt('');
    setResponse('');
    setError('');
    setStatus('idle');
  }, []);

  const busy = status === 'loading' || status === 'streaming';

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Play size={28} className="text-blaze-400" />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Playground</h1>
        </div>
        <p className="mt-2 max-w-2xl text-gray-400">
          Send a real request to the BlazeConsole API and watch the response stream back live.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <div className="card flex flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <label htmlFor="prompt" className="text-sm font-semibold text-white">
              Prompt
            </label>
            <div className="flex items-center gap-2 rounded-md border border-base-700 bg-base-900 px-2.5 py-1 text-xs text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blaze-500" />
              {MODEL.name}
            </div>
          </div>

          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send();
            }}
            placeholder="Enter your prompt here..."
            rows={8}
            className="input-field resize-none font-mono text-sm leading-relaxed"
            disabled={busy}
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {prompt.length.toLocaleString()} chars
            </span>
            <span className="text-xs text-gray-500">
              <kbd className="rounded border border-base-700 bg-base-800 px-1.5 py-0.5 font-mono text-[10px]">⌘/Ctrl + Enter</kbd> to send
            </span>
          </div>

          {/* Sample prompts */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Try a sample</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  disabled={busy}
                  className="rounded-full border border-base-700 bg-base-850 px-3 py-1 text-xs text-gray-400 transition-colors hover:border-blaze-500/40 hover:text-blaze-300 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {busy ? (
              <button onClick={stop} className="btn-primary bg-error-500 hover:bg-error-600">
                <Square size={16} /> Stop
              </button>
            ) : (
              <button onClick={send} disabled={!prompt.trim()} className="btn-primary">
                <Send size={16} /> Send
              </button>
            )}
            <button onClick={reset} className="btn-secondary" disabled={busy}>
              Clear
            </button>
          </div>
        </div>

        {/* Response panel */}
        <div className="card flex flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Response</span>
            <StatusBadge status={status} />
          </div>

          <div className="min-h-[300px] flex-1 rounded-lg border border-base-700 bg-base-950/60 p-4">
            {status === 'idle' && (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                <Play size={32} className="text-gray-600" />
                <p className="mt-3 text-sm text-gray-500">Send a prompt to see the response here.</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                <Loader2 size={28} className="animate-spin text-blaze-400" />
                <p className="mt-3 text-sm text-gray-400">Connecting to Blaze v1...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle size={28} className="text-error-400" />
                <p className="mt-3 max-w-sm text-sm text-error-400">{error}</p>
              </div>
            )}

            {status === 'empty' && (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                <p className="text-sm text-gray-500">The model returned an empty response.</p>
              </div>
            )}

            {(status === 'streaming' || status === 'completed') && (
              <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-200">
                {response}
                {status === 'streaming' && (
                  <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-blaze-400 align-middle" />
                )}
              </div>
            )}
          </div>

          {response && status === 'completed' && (
            <button
              onClick={() => navigator.clipboard.writeText(response).catch(() => {})}
              className="btn-ghost mt-3 self-start text-xs"
            >
              Copy response
            </button>
          )}
        </div>
      </div>

      {/* Below: the raw request this playground sends */}
      <div className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-white">The request this playground sends</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <CodeBlock
            code={`fetch("${SITE.apiFullUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "${MODEL.id}",
    message: "${prompt.trim() || 'Your prompt here'}"
  })
});`}
            language="javascript"
            filename="playground-request.js"
            showCopy={false}
          />
          <CodeBlock code={RESPONSE_EXAMPLE} language="json" filename="response.json" showCopy={false} />
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        The playground calls the public API directly — no credentials are stored or sent from your browser.{' '}
        <Link to="/docs" className="text-blaze-400 hover:underline">Read the docs</Link>.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; color: string }> = {
    idle: { label: 'Idle', color: 'bg-gray-600' },
    loading: { label: 'Loading', color: 'bg-warning-500' },
    streaming: { label: 'Streaming', color: 'bg-blaze-500 animate-pulse-dot' },
    completed: { label: 'Completed', color: 'bg-success-500' },
    error: { label: 'Error', color: 'bg-error-500' },
    empty: { label: 'Empty', color: 'bg-gray-600' },
  };
  const { label, color } = map[status];
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
