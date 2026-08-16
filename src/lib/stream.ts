/**
 * Streaming SSE parser for the playground.
 * Reads a fetch Response stream, parses `data:` SSE lines, and invokes
 * onDelta with extracted text chunks. Resolves when the stream ends.
 */
export async function readSseStream(
  body: ReadableStream<Uint8Array> | null,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const abortHandler = () => reader.cancel().catch(() => {});
  signal?.addEventListener("abort", abortHandler);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      // Keep the last (possibly partial) line in the buffer.
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
          };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
        } catch {
          // Partial JSON across chunks — will complete on next read.
        }
      }
    }
  } finally {
    signal?.removeEventListener("abort", abortHandler);
    reader.releaseLock();
  }
}
