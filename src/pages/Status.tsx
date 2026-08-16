import { useCallback, useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { MODEL, SITE } from '@/lib/constants';

interface HealthState {
  apiOk: boolean | null;
  modelOk: boolean | null;
  detail: string;
  lastChecked: Date | null;
  loading: boolean;
}

const INITIAL: HealthState = {
  apiOk: null,
  modelOk: null,
  detail: '',
  lastChecked: null,
  loading: false,
};

export default function Status() {
  const [state, setState] = useState<HealthState>(INITIAL);

  const check = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(SITE.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL.id, message: 'ping' }),
      });

      const ok = res.ok;
      const contentType = res.headers.get('content-type') ?? '';

      // A streaming or JSON success means both the gateway and the model are up.
      if (ok && (contentType.includes('text/event-stream') || contentType.includes('application/json'))) {
        // Consume the body so the connection doesn't hang.
        if (contentType.includes('text/event-stream')) {
          await res.body?.cancel();
        }
        setState({
          apiOk: true,
          modelOk: true,
          detail: 'Pipeline reachable',
          lastChecked: new Date(),
          loading: false,
        });
        return;
      }

      // Non-OK: read the error for detail but never expose internals beyond a generic label.
      const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
      const code = body?.error?.code;
      setState({
        apiOk: false,
        modelOk: false,
        detail: code === 'AI_SERVICE_UNAVAILABLE' ? 'Backend not reachable' : 'Service responded with an error',
        lastChecked: new Date(),
        loading: false,
      });
    } catch {
      setState({
        apiOk: false,
        modelOk: false,
        detail: 'Network error',
        lastChecked: new Date(),
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const services = [
    { name: 'BlazeConsole API', ok: state.apiOk, desc: 'Public API gateway' },
    { name: MODEL.name, ok: state.modelOk, desc: 'AI model availability' },
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <Activity size={28} className="text-blaze-400" />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Status</h1>
        </div>
        <p className="mt-2 max-w-2xl text-gray-400">
          Real-time health check of the BlazeConsole platform. This page performs a live request to the API on load.
        </p>
      </div>

      <div className="space-y-4">
        {services.map((svc) => (
          <div key={svc.name} className="card flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <StatusIcon ok={svc.ok} loading={state.loading} />
              <div>
                <p className="text-sm font-semibold text-white">{svc.name}</p>
                <p className="text-xs text-gray-500">{svc.desc}</p>
              </div>
            </div>
            <StatusLabel ok={svc.ok} loading={state.loading} />
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-base-700/40 pt-6 sm:flex-row sm:items-center">
        <div className="text-sm text-gray-500">
          {state.lastChecked ? (
            <>Last checked: <span className="text-gray-300">{state.lastChecked.toLocaleString()}</span></>
          ) : (
            'Not checked yet'
          )}
        </div>
        <button onClick={check} disabled={state.loading} className="btn-secondary text-sm">
          {state.loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Recheck
        </button>
      </div>

      <p className="mt-8 text-xs text-gray-500">
        This status page reflects a real health-check request made at load time. It does not display uptime percentages,
        request counts, or latency statistics, as detailed monitoring is not currently exposed.
      </p>
    </div>
  );
}

function StatusIcon({ ok, loading }: { ok: boolean | null; loading: boolean }) {
  if (loading) return <Loader2 size={24} className="animate-spin text-warning-400" />;
  if (ok === null) return <div className="h-6 w-6 rounded-full bg-gray-600" />;
  if (ok) return <CheckCircle2 size={24} className="text-success-400" />;
  return <XCircle size={24} className="text-error-400" />;
}

function StatusLabel({ ok, loading }: { ok: boolean | null; loading: boolean }) {
  if (loading) return <span className="text-sm font-medium text-warning-400">Checking...</span>;
  if (ok === null) return <span className="text-sm font-medium text-gray-500">Unknown</span>;
  if (ok) return <span className="text-sm font-medium text-success-400">Operational</span>;
  return <span className="text-sm font-medium text-error-400">Unavailable</span>;
}
