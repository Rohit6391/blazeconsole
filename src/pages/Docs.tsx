import { useState } from 'react';
import { BookOpen, Hash, Link as LinkIcon } from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';
import { SITE, MODEL, API_ERRORS } from '@/lib/constants';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'chat-api', label: 'Chat API' },
  { id: 'request', label: 'Request' },
  { id: 'response', label: 'Response' },
  { id: 'streaming', label: 'Streaming' },
  { id: 'errors', label: 'Errors' },
  { id: 'models', label: 'Models' },
  { id: 'examples', label: 'Examples' },
  { id: 'blazelang', label: 'BlazeLang Integration' },
];

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

const STREAM_JS_EXAMPLE = `const response = await fetch("${SITE.apiFullUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "blaze-v1",
    message: "Stream me a story"
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value, { stream: true });
  // Parse SSE "data:" lines for delta content
  for (const line of text.split("\\n")) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") return;
    const parsed = JSON.parse(payload);
    const delta = parsed.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
}`;

const BLAZELANG_EXAMPLE = `Import AI from "ai"

var answer = AI.Ask("Explain structs in BlazeLang")

Print(answer)`;

export default function Docs() {
  const [active, setActive] = useState('introduction');

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <BookOpen size={28} className="text-blaze-400" />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Documentation</h1>
        </div>
        <p className="mt-2 max-w-2xl text-gray-400">
          Everything you need to integrate the BlazeConsole API into your application.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active === s.id
                    ? 'bg-base-800 text-blaze-400'
                    : 'text-gray-400 hover:bg-base-850 hover:text-gray-200'
                }`}
              >
                <Hash size={14} className="opacity-60" />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="max-w-3xl space-y-12">
          <Section id="introduction" title="Introduction">
            <p>
              BlazeConsole is a developer-focused AI API built for the Blaze ecosystem. It exposes a single
              public model — <strong className="text-white">{MODEL.name}</strong> — through one endpoint,
              with a clean JSON request/response contract and optional streaming.
            </p>
            <p>
              The API is designed to be simple: send a <code className="code-inline">POST</code> with a
              <code className="code-inline">model</code> and a <code className="code-inline">message</code>,
              and receive the generated response. No SDK is required.
            </p>
          </Section>

          <Section id="authentication" title="Authentication">
            <p>
              The public BlazeConsole API does not require an API key or token in the browser. Authentication
              with the underlying backend is handled entirely server-side by the Netlify function, which uses
              a dedicated service account. No private credentials are ever exposed to the client.
            </p>
            <div className="callout">
              <p>
                You do not need to send an <code className="code-inline">Authorization</code> header. Doing so
                has no effect on the public endpoint.
              </p>
            </div>
          </Section>

          <Section id="chat-api" title="Chat API">
            <p>The Chat API is the core endpoint of BlazeConsole.</p>
            <div className="card p-5">
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded bg-blaze-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-blaze-300">POST</span>
                <code className="font-mono text-sm text-gray-200">{SITE.apiFullUrl}</code>
              </div>
            </div>
            <p className="mt-4">
              The endpoint accepts <code className="code-inline">application/json</code> bodies and returns
              either a JSON response or a <code className="code-inline">text/event-stream</code> when streaming.
            </p>
          </Section>

          <Section id="request" title="Request">
            <p>The request body is a JSON object with two fields:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-base-700 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="py-2 pr-4 font-medium">Field</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Required</th>
                    <th className="py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-base-700/50">
                    <td className="py-2 pr-4 font-mono text-blaze-300">model</td>
                    <td className="py-2 pr-4 text-gray-400">string</td>
                    <td className="py-2 pr-4 text-gray-400">Yes</td>
                    <td className="py-2">Must be <code className="code-inline">{MODEL.id}</code>.</td>
                  </tr>
                  <tr className="border-b border-base-700/50">
                    <td className="py-2 pr-4 font-mono text-blaze-300">message</td>
                    <td className="py-2 pr-4 text-gray-400">string</td>
                    <td className="py-2 pr-4 text-gray-400">Yes</td>
                    <td className="py-2">The prompt text. Max 8,000 characters.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <CodeBlock
              code={`{
  "model": "blaze-v1",
  "message": "Explain structs in BlazeLang"
}`}
              language="json"
              filename="request-body.json"
              showCopy={false}
            />
          </Section>

          <Section id="response" title="Response">
            <p>A successful non-streaming response returns a JSON object:</p>
            <CodeBlock
              code={`{
  "model": "blaze-v1",
  "response": "Hello! How can I help?"
}`}
              language="json"
              filename="response.json"
              showCopy={false}
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-base-700 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="py-2 pr-4 font-medium">Field</th>
                    <th className="py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-base-700/50">
                    <td className="py-2 pr-4 font-mono text-blaze-300">model</td>
                    <td className="py-2">The public model identifier: <code className="code-inline">{MODEL.id}</code>.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-blaze-300">response</td>
                    <td className="py-2">The generated text from {MODEL.name}.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="streaming" title="Streaming">
            <p>
              BlazeConsole supports streaming responses via Server-Sent Events
              (<code className="code-inline">text/event-stream</code>). When the backend returns a stream,
              the gateway passes it through directly without buffering the entire response.
            </p>
            <p>
              Each SSE line begins with <code className="code-inline">data:</code> followed by a JSON chunk
              containing a <code className="code-inline">choices[0].delta.content</code> field. The stream
              terminates with <code className="code-inline">data: [DONE]</code>.
            </p>
            <CodeBlock code={STREAM_JS_EXAMPLE} language="javascript" filename="stream.js" />
          </Section>

          <Section id="errors" title="Errors">
            <p>All errors use a consistent JSON shape:</p>
            <CodeBlock
              code={`{
  "error": {
    "code": "MODEL_NOT_FOUND",
    "message": "Only blaze-v1 is currently available."
  }
}`}
              language="json"
              filename="error.json"
              showCopy={false}
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-base-700 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="py-2 pr-4 font-medium">Code</th>
                    <th className="py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {API_ERRORS.map((e) => (
                    <tr key={e.code} className="border-b border-base-700/50">
                      <td className="py-2 pr-4 font-mono text-blaze-300 whitespace-nowrap">{e.code}</td>
                      <td className="py-2 text-gray-400">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="models" title="Models">
            <p>BlazeConsole currently exposes exactly one public model:</p>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{MODEL.name}</p>
                  <p className="mt-0.5 font-mono text-sm text-gray-400">{MODEL.id}</p>
                </div>
                <span className="rounded-full border border-success-500/30 bg-success-500/10 px-3 py-1 text-xs font-medium text-success-400">
                  {MODEL.status}
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-400">{MODEL.description}</p>
            </div>
            <p className="text-xs text-gray-500">
              Requesting any other model returns a <code className="code-inline">MODEL_NOT_FOUND</code> error.
            </p>
          </Section>

          <Section id="examples" title="Examples">
            <p>Here is the same request in three languages:</p>
            <div className="space-y-6">
              <CodeBlock code={CURL_EXAMPLE} language="curl" filename="curl" />
              <CodeBlock code={JS_EXAMPLE} language="javascript" filename="fetch.js" />
              <CodeBlock code={PYTHON_EXAMPLE} language="python" filename="request.py" />
            </div>
          </Section>

          <Section id="blazelang" title="BlazeLang Integration">
            <p>
              BlazeLang can use BlazeConsole as its default AI backend. The conceptual architecture is:
            </p>
            <div className="card p-6">
              <div className="flex flex-col items-center gap-3 text-center text-sm text-gray-300">
                <span className="rounded-lg bg-base-800 px-4 py-2 font-medium text-white">BlazeLang</span>
                <span className="text-gray-600">&darr;</span>
                <span className="rounded-lg bg-base-800 px-4 py-2 font-medium text-white">Blaze AI module</span>
                <span className="text-gray-600">&darr;</span>
                <span className="rounded-lg bg-base-800 px-4 py-2 font-medium text-white">BlazeConsole API</span>
                <span className="text-gray-600">&darr;</span>
                <span className="rounded-lg bg-blaze-500/15 px-4 py-2 font-medium text-blaze-300">{MODEL.name}</span>
              </div>
            </div>
            <p>Example BlazeLang usage:</p>
            <CodeBlock code={BLAZELANG_EXAMPLE} language="blazelang" filename="main.blaze" />
            <p className="text-xs text-gray-500">
              This is a conceptual integration. No BlazeLang package is published yet.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4 text-sm leading-relaxed text-gray-400">
      <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
        <LinkIcon size={18} className="text-gray-600" />
        {title}
      </h2>
      {children}
    </section>
  );
}
