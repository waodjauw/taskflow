import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE = "https://api.deepseek.com/v1/chat/completions";

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `你是一个智能任务管理助手。当前日期是 ${new Date().toLocaleDateString("zh-CN")}。所有日期输出统一使用 YYYY-MM-DDTHH:mm 格式。`;

async function callDeepSeek({ messages, max_tokens = 512, stream = false }) {
  const res = await fetch(DEEPSEEK_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens,
      stream,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 请求失败 (${res.status})`);
  }
  return res;
}

// POST /api/ai/parse-task — 自然语言 → 结构化任务对象
app.post("/api/ai/parse-task", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "缺少文本输入" });

    const response = await callDeepSeek({
      messages: [
        { role: "system", content: SYSTEM_PROMPT + " 你的回复必须是一个严格的 JSON 对象，不要包含其他内容。" },
        {
          role: "user",
          content: `将以下自然语言描述解析为任务对象。请推断标题、描述、优先级、分类、截止日期、周期和初始进度。\n\n描述：${text}\n\n按以下 JSON 格式输出（不要包含 markdown 代码块）：\n{"title":"任务标题","desc":"任务描述或空字符串","cat":"work|study|personal|health|finance 之一","priority":"critical|high|medium|low 之一","deadline":"YYYY-MM-DDTHH:mm 或空字符串","cycle":"none|daily|weekly|monthly 之一","progress":0到100的整数,"confidence":"high|medium|low"}`,
        },
      ],
      max_tokens: 512,
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("无法解析 AI 返回的 JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (e) {
    console.error("parse-task error:", e.message);
    res.status(500).json({ error: "AI 解析失败: " + e.message });
  }
});

// POST /api/ai/breakdown — 大目标 → 子任务列表
app.post("/api/ai/breakdown", async (req, res) => {
  try {
    const { goal, existingTasks = [] } = req.body;
    if (!goal) return res.status(400).json({ error: "缺少目标描述" });

    const existingHint = existingTasks.length
      ? `\n注意：用户已存在以下任务，请避免重复：${existingTasks.join("、")}`
      : "";

    const response = await callDeepSeek({
      messages: [
        { role: "system", content: SYSTEM_PROMPT + " 你的回复必须是一个严格的 JSON 数组，不要包含其他内容。" },
        {
          role: "user",
          content: `将以下大目标拆解为 3-6 个可执行的子任务。每个子任务应具体、可衡量。${existingHint}\n\n大目标：${goal}\n\n按以下 JSON 数组格式输出（不要包含 markdown 代码块）：\n[{"title":"子任务标题","desc":"简要描述","priority":"critical|high|medium|low","cat":"work|study|personal|health|finance"}]`,
        },
      ],
      max_tokens: 1024,
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("无法解析 AI 返回的 JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (e) {
    console.error("breakdown error:", e.message);
    res.status(500).json({ error: "AI 拆解失败: " + e.message });
  }
});

// POST /api/ai/weekly-report — SSE 流式 Markdown 周报
app.post("/api/ai/weekly-report", async (req, res) => {
  const { tasks = [], stats = {} } = req.body;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const taskSummary = tasks
      .map((t) => {
        const status = t.done ? "✓" : new Date(t.deadline) < new Date() ? "⚠" : "○";
        return `- ${status} ${t.title} (${t.progress || 0}%) ${t.cat || ""}`;
      })
      .join("\n");

    const response = await fetch(DEEPSEEK_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `根据以下本周任务数据，生成一份简明的 Markdown 格式周报。包括：总体完成情况、进行中的任务、逾期任务（如有）、下周建议。\n\n总任务数: ${stats.total || 0}\n已完成: ${stats.done || 0}\n完成率: ${stats.rate || 0}%\n逾期: ${stats.overdue || 0}\n\n任务详情:\n${taskSummary}\n\n请以 Markdown 格式输出周报，不要包含 JSON。`,
          },
        ],
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API 请求失败 (${response.status})`);
    }

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
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const jsonStr = trimmed.slice(6);
        if (jsonStr === "[DONE]") continue;

        try {
          const chunk = JSON.parse(jsonStr);
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) send({ chunk: content });
        } catch {
          // skip unparseable lines
        }
      }
    }

    send({ done: true });
  } catch (e) {
    console.error("weekly-report stream error:", e.message);
    send({ error: "AI 生成中断: " + e.message });
  } finally {
    res.end();
  }
});

// 生产模式：托管 dist 静态文件
const distPath = path.resolve(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("/{*splat}", (_req, res) => res.sendFile(path.join(distPath, "index.html")));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Using: DeepSeek (deepseek-chat)`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/ai/parse-task`);
  console.log(`  POST /api/ai/breakdown`);
  console.log(`  POST /api/ai/weekly-report (SSE)`);
});
