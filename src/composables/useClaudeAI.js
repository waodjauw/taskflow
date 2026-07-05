export function useClaudeAI() {
  const BASE = "/api/ai";

  async function parseNaturalLanguage(text) {
    const res = await fetch(`${BASE}/parse-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "请求失败" }));
      throw new Error(err.error || "AI 解析失败");
    }
    return res.json();
  }

  async function breakdownGoal(goal, existingTasks = []) {
    const res = await fetch(`${BASE}/breakdown`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, existingTasks }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "请求失败" }));
      throw new Error(err.error || "AI 拆解失败");
    }
    return res.json();
  }

  function streamWeeklyReport(tasks, stats, { onChunk, onDone, onError }) {
    let aborted = false;
    let lastCharCount = 0;
    let retries = 0;
    const MAX_RETRIES = 2;

    function connect(retryCharCount = 0) {
      const body = JSON.stringify({ tasks, stats, lastCharCount: retryCharCount });

      fetch(`${BASE}/weekly-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: (() => {
          const ctrl = new AbortController();
          if (typeof AbortController !== "undefined") return ctrl.signal;
          return undefined;
        })(),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("请求失败");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6);

              if (data === "[DONE]") {
                onDone?.();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.chunk) {
                  lastCharCount += parsed.chunk.length;
                  onChunk?.(parsed.chunk);
                }
                if (parsed.done) {
                  onDone?.();
                  return;
                }
              } catch (e) {
                if (e.message.includes("AI")) throw e;
              }
            }
          }
        })
        .catch((e) => {
          if (aborted) return;
          if (retries < MAX_RETRIES) {
            retries++;
            setTimeout(() => connect(lastCharCount), 1000 * retries);
          } else {
            onError?.(e.message || "流式生成中断");
          }
        });
    }

    connect();

    return () => {
      aborted = true;
    };
  }

  return { parseNaturalLanguage, breakdownGoal, streamWeeklyReport };
}
