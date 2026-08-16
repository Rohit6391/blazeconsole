import { useEffect, useRef } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showCopy?: boolean;
}

export default function CodeBlock({ code, language = 'bash', filename, showCopy = true }: CodeBlockProps) {
  const copiedRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      if (copiedRef.current) {
        copiedRef.current.textContent = 'Copied!';
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (copiedRef.current) copiedRef.current.textContent = '';
        }, 2000);
      }
    } catch {
      // Clipboard may be unavailable — silent fail.
    }
  };

  return (
    <div className="code-block overflow-hidden">
      <div className="flex items-center justify-between border-b border-base-700/60 bg-base-900/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-error-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success-500/70" />
          </span>
          <span className="ml-2 text-xs font-medium text-gray-400">
            {filename || language}
          </span>
        </div>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-base-700 hover:text-gray-100"
            aria-label="Copy code"
          >
            <Check size={13} className={copiedRef.current?.textContent ? 'block' : 'hidden'} />
            <Copy size={13} className={copiedRef.current?.textContent ? 'hidden' : 'block'} />
            <span ref={copiedRef} />
            {!copiedRef.current?.textContent && 'Copy'}
          </button>
        )}
      </div>
      <pre className="overflow-x-auto p-4 text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
