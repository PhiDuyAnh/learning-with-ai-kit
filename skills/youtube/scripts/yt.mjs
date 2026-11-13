#!/usr/bin/env node
// YouTube helper for learning-with-ai-kit. No npm dependencies; needs the yt-dlp binary on PATH.
//
//   node yt.mjs search "<query>" [--max 5] [--min-duration 300] [--max-duration 3600] [--upload-date week]
//   node yt.mjs info <url>
//   node yt.mjs captions <url> [--lang en]
//   node yt.mjs transcribe <url-or-audio-file> [--provider auto|captions|gemini|elevenlabs|openai] [--lang en]
//   node yt.mjs doctor     -> what's installed, which providers are ready, current setting
//
// Common flags: --json (machine-readable output), --out <file> (write instead of stdout).
// Exit codes: 0 ok, 1 usage or runtime error, 2 missing tool or API key, 3 no captions found.
//
// API keys come from the environment, or from ~/.learning-with-ai-kit/.env (KEY=value lines).
// Environment variables win over the file.

import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { parseArgs, promisify } from "node:util";

const run = promisify(execFile);

const CONFIG_PATH = process.env.LEARNING_WITH_AI_KIT_CONFIG ?? join(homedir(), ".learning-with-ai-kit", "config.json");
const ENV_PATH = join(dirname(CONFIG_PATH), ".env");
const KEY_NAMES = ["GEMINI_API_KEY", "GOOGLE_API_KEY", "ELEVENLABS_API_KEY", "OPENAI_API_KEY"];

// Where each key came from, for `doctor`: "environment", ".env file", or undefined.
const keySources = {};

function loadEnvFile() {
  for (const name of KEY_NAMES) if (process.env[name]) keySources[name] = "environment";
  let text;
  try {
    text = readFileSync(ENV_PATH, "utf8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const [, name, raw] = match;
    const value = raw.replace(/^(['"])(.*)\1$/, "$2");
    if (value && !process.env[name]) {
      process.env[name] = value;
      if (KEY_NAMES.includes(name)) keySources[name] = ".env file";
    }
  }
}

class ExitError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}

// ---------- helpers ----------

async function ytdlp(args) {
  try {
    const { stdout } = await run("yt-dlp", args, { maxBuffer: 64 * 1024 * 1024 });
    return stdout;
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new ExitError(
        "YTDLP_MISSING: yt-dlp is not installed or not on PATH. See https://github.com/yt-dlp/yt-dlp#installation",
        2,
      );
    }
    throw new ExitError(`yt-dlp failed: ${(err.stderr || err.message).trim()}`);
  }
}

function requireKey(name) {
  const value = process.env[name];
  if (!value) throw new ExitError(`${name} is not set.`, 2);
  return value;
}

function timestamp(seconds) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

function videoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
  return match?.[1] ?? null;
}

// Merge small pieces of text into paragraphs of roughly `windowSec` seconds,
// so transcripts read as text but keep timestamps to jump back to.
function toParagraphs(pieces, windowSec = 30) {
  const paragraphs = [];
  let current = null;
  for (const { start, text } of pieces) {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) continue;
    if (!current || start - current.start >= windowSec) {
      current = { start, text: clean };
      paragraphs.push(current);
    } else {
      current.text += " " + clean;
    }
  }
  return paragraphs;
}

function transcriptMarkdown({ title, url, source, paragraphs }) {
  const id = url ? videoId(url) : null;
  const lines = [`# ${title ?? "Transcript"}`, ""];
  if (url) lines.push(`Source: ${url}`);
  lines.push(`Transcribed with: ${source}`, "");
  for (const p of paragraphs) {
    const ts = timestamp(p.start);
    const link = id ? `[${ts}](https://youtu.be/${id}?t=${Math.floor(p.start)})` : `[${ts}]`;
    lines.push(`${link} ${p.text}`, "");
  }
  return lines.join("\n");
}

// ---------- search & info ----------

const UPLOAD_DATE_FILTERS = { today: "EgIIAg%3D%3D", week: "EgIIAw%3D%3D", month: "EgIIBA%3D%3D", year: "EgIIBQ%3D%3D" };

async function search(query, opts) {
  const max = Number(opts.max ?? 5);
  const minDuration = opts["min-duration"] ? Number(opts["min-duration"]) : 0;
  const maxDuration = opts["max-duration"] ? Number(opts["max-duration"]) : Infinity;
  // Over-fetch when filtering by duration, since filtering happens after the search.
  const fetchCount = minDuration || maxDuration !== Infinity ? max * 4 : max;

  let target = `ytsearch${fetchCount}:${query}`;
  if (opts["upload-date"]) {
    const sp = UPLOAD_DATE_FILTERS[opts["upload-date"]];
    if (!sp) throw new ExitError(`--upload-date must be one of: ${Object.keys(UPLOAD_DATE_FILTERS).join(", ")}`);
    target = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=${sp}`;
  }

  const raw = JSON.parse(await ytdlp(["-J", "--flat-playlist", "--playlist-end", String(fetchCount), target]));
  const results = (raw.entries ?? [])
    .filter((e) => e.duration == null || (e.duration >= minDuration && e.duration <= maxDuration))
    .slice(0, max)
    .map((e) => ({
      title: e.title,
      url: e.url?.startsWith("http") ? e.url : `https://www.youtube.com/watch?v=${e.id}`,
      channel: e.channel ?? e.uploader ?? null,
      duration: e.duration != null ? timestamp(e.duration) : null,
      views: e.view_count ?? null,
    }));

  const text = results
    .map((r, i) => `${i + 1}. [${r.title}](${r.url}): ${r.channel ?? "unknown channel"}, ${r.duration ?? "?"}, ${r.views?.toLocaleString("en-US") ?? "?"} views`)
    .join("\n");
  return { json: { query, results }, text: text || "No results." };
}

async function info(url) {
  const raw = JSON.parse(await ytdlp(["-J", "--no-playlist", "--skip-download", url]));
  const data = {
    title: raw.title,
    url: raw.webpage_url,
    channel: raw.channel ?? raw.uploader,
    uploadDate: raw.upload_date?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
    duration: timestamp(raw.duration ?? 0),
    chapters: (raw.chapters ?? []).map((c) => ({ start: timestamp(c.start_time), title: c.title })),
    hasCaptions: Object.keys(raw.subtitles ?? {}).length > 0,
    hasAutoCaptions: Object.keys(raw.automatic_captions ?? {}).length > 0,
    description: raw.description,
  };
  const text = [
    `# ${data.title}`,
    `${data.channel} · ${data.uploadDate} · ${data.duration}`,
    `Captions: ${data.hasCaptions ? "manual" : data.hasAutoCaptions ? "auto-generated only" : "none"}`,
    data.chapters.length ? "\n## Chapters\n" + data.chapters.map((c) => `- ${c.start} ${c.title}`).join("\n") : "",
    "\n## Description\n" + (data.description ?? ""),
  ].join("\n");
  return { json: data, text };
}

// ---------- captions (free, fastest) ----------

async function captions(url, opts) {
  const lang = opts.lang ?? "en";
  const dir = await mkdtemp(join(tmpdir(), "learning-with-ai-kit-yt-"));
  try {
    // --print implies --simulate, so --no-simulate keeps the subtitle files being written.
    const out = await ytdlp([
      "--skip-download", "--no-simulate", "--no-playlist",
      "--write-subs", "--write-auto-subs",
      "--sub-langs", `${lang},${lang}-orig,${lang}.*`,
      "--sub-format", "json3",
      "--print", "title",
      "-o", join(dir, "%(id)s.%(ext)s"),
      url,
    ]);
    const title = out.trim().split("\n")[0];

    const files = (await readdir(dir)).filter((f) => f.endsWith(".json3"));
    if (!files.length) throw new ExitError(`No "${lang}" captions for this video.`, 3);
    // Shortest name first: <id>.en.json3 beats <id>.en-orig.json3 and regional variants.
    files.sort((a, b) => a.length - b.length);
    const data = JSON.parse(await readFile(join(dir, files[0]), "utf8"));

    const pieces = (data.events ?? [])
      .filter((e) => e.segs)
      .map((e) => ({ start: e.tStartMs / 1000, text: e.segs.map((s) => s.utf8).join("") }));
    return { title, url, source: `YouTube captions (${files[0].split(".").slice(1, -1).join(".")})`, paragraphs: toParagraphs(pieces) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// ---------- providers that need audio ----------

async function downloadAudio(url) {
  const dir = await mkdtemp(join(tmpdir(), "learning-with-ai-kit-audio-"));
  // m4a/webm audio streams need no ffmpeg; prefer a low bitrate to stay under upload limits.
  const out = await ytdlp([
    "--no-playlist", "--no-simulate",
    "-f", "bestaudio[ext=m4a][abr<=96]/bestaudio[ext=m4a]/bestaudio",
    "--print", "title",
    "--print", "after_move:filepath",
    "-o", join(dir, "%(id)s.%(ext)s"),
    url,
  ]);
  const [title, path] = out.trim().split("\n");
  return { dir, path, title };
}

async function withAudio(input, fn) {
  if (existsSync(input)) return fn({ path: input, title: basename(input), url: null });
  const audio = await downloadAudio(input);
  try {
    return await fn({ ...audio, url: input });
  } finally {
    await rm(audio.dir, { recursive: true, force: true });
  }
}

async function postForm(url, headers, form) {
  const res = await fetch(url, { method: "POST", headers, body: form });
  if (!res.ok) throw new ExitError(`${url} returned ${res.status}: ${await res.text()}`);
  return res.json();
}

async function elevenlabs(input, opts) {
  const key = requireKey("ELEVENLABS_API_KEY");
  return withAudio(input, async ({ path, title, url }) => {
    const form = new FormData();
    form.append("file", new Blob([await readFile(path)]), basename(path));
    form.append("model_id", process.env.ELEVENLABS_MODEL ?? "scribe_v1");
    if (opts.lang) form.append("language_code", opts.lang);
    const data = await postForm("https://api.elevenlabs.io/v1/speech-to-text", { "xi-api-key": key }, form);
    const pieces = (data.words ?? []).filter((w) => w.type !== "spacing").map((w) => ({ start: w.start, text: w.text }));
    const paragraphs = pieces.length ? toParagraphs(pieces) : [{ start: 0, text: data.text }];
    return { title, url, source: "ElevenLabs Scribe", paragraphs };
  });
}

const OPENAI_MAX_BYTES = 25 * 1024 * 1024;

async function openai(input, opts) {
  const key = requireKey("OPENAI_API_KEY");
  return withAudio(input, async ({ path, title, url }) => {
    const { size } = await stat(path);
    if (size > OPENAI_MAX_BYTES) {
      throw new ExitError(`Audio is ${(size / 1e6).toFixed(0)} MB; OpenAI accepts 25 MB. Use --provider elevenlabs or captions.`);
    }
    const form = new FormData();
    form.append("file", new Blob([await readFile(path)]), basename(path));
    form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1");
    form.append("response_format", "verbose_json");
    if (opts.lang) form.append("language", opts.lang);
    const data = await postForm("https://api.openai.com/v1/audio/transcriptions", { Authorization: `Bearer ${key}` }, form);
    const pieces = (data.segments ?? []).map((s) => ({ start: s.start, text: s.text }));
    return { title, url, source: "OpenAI Whisper", paragraphs: pieces.length ? toParagraphs(pieces) : [{ start: 0, text: data.text }] };
  });
}

const GEMINI_PROMPT = `Transcribe this video verbatim in its spoken language.
Output plain lines of the form "[mm:ss] text", one line about every 30 seconds of speech.
When the screen shows something important that the speech does not say (slides, code, diagrams, formulas), add a line "[mm:ss] (on screen: <short description>)".
Output only the transcript.`;

async function gemini(url) {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!key) throw new ExitError("GEMINI_API_KEY (or GOOGLE_API_KEY) is not set.", 2);
  if (!videoId(url)) throw new ExitError("Gemini transcription takes a YouTube URL, not a local file.");
  const model = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ contents: [{ parts: [{ file_data: { file_uri: url } }, { text: GEMINI_PROMPT }] }] }),
  });
  if (!res.ok) throw new ExitError(`Gemini returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const pieces = text.split("\n").flatMap((line) => {
    const m = line.match(/^\[(?:(\d+):)?(\d+):(\d{2})\]\s*(.*)$/);
    return m ? [{ start: Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]), text: m[4] }] : [];
  });
  return { title: null, url, source: `Gemini (${model})`, paragraphs: pieces.length ? pieces : [{ start: 0, text }] };
}

// The `transcriber` value from the learn skill's config, used when no --provider flag is given.
function configuredTranscriber() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf8")).transcriber;
  } catch {
    return undefined;
  }
}

async function transcribe(input, opts) {
  const provider = opts.provider ?? configuredTranscriber() ?? "auto";
  const providers = { captions, gemini, elevenlabs, openai };
  if (provider !== "auto") {
    if (!providers[provider]) throw new ExitError(`Unknown provider "${provider}".`);
    return providers[provider](input, opts);
  }
  // auto: free captions first, then whichever paid provider has a key.
  // A missing yt-dlp stops here on purpose: the user should install it, not pay for a fallback.
  if (!existsSync(input)) {
    try {
      return await captions(input, opts);
    } catch (err) {
      if (err.code !== 3) throw err;
    }
  }
  if ((process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) && !existsSync(input)) return gemini(input);
  if (process.env.ELEVENLABS_API_KEY) return elevenlabs(input, opts);
  if (process.env.OPENAI_API_KEY) return openai(input, opts);
  throw new ExitError("No captions found, and no transcription key set (GEMINI_API_KEY, ELEVENLABS_API_KEY, or OPENAI_API_KEY).", 2);
}

// ---------- doctor ----------

// Reports setup state without ever printing key values.
async function doctor() {
  let ytdlpVersion = null;
  try {
    ytdlpVersion = (await run("yt-dlp", ["--version"])).stdout.trim();
  } catch {}

  const keyStatus = (name) => (process.env[name] ? keySources[name] ?? "environment" : null);
  const geminiKey = keyStatus("GEMINI_API_KEY") ?? keyStatus("GOOGLE_API_KEY");
  const providers = {
    captions: { ready: Boolean(ytdlpVersion), needs: "yt-dlp", cost: "free" },
    gemini: { ready: Boolean(geminiKey), keySource: geminiKey, needs: "GEMINI_API_KEY", cost: "paid" },
    elevenlabs: { ready: Boolean(ytdlpVersion && keyStatus("ELEVENLABS_API_KEY")), keySource: keyStatus("ELEVENLABS_API_KEY"), needs: "ELEVENLABS_API_KEY + yt-dlp", cost: "paid" },
    openai: { ready: Boolean(ytdlpVersion && keyStatus("OPENAI_API_KEY")), keySource: keyStatus("OPENAI_API_KEY"), needs: "OPENAI_API_KEY + yt-dlp", cost: "paid" },
  };
  const data = {
    node: process.version,
    ytdlp: ytdlpVersion,
    transcriber: configuredTranscriber() ?? "auto",
    envFile: { path: ENV_PATH, exists: existsSync(ENV_PATH) },
    providers,
  };

  const mark = (ok) => (ok ? "✓" : "✗");
  const text = [
    `Node: ${data.node}`,
    `yt-dlp: ${ytdlpVersion ? `✓ ${ytdlpVersion}` : "✗ not installed"}`,
    `Transcriber setting: ${data.transcriber}`,
    `Key file: ${ENV_PATH} (${data.envFile.exists ? "exists" : "not created"})`,
    "",
    "Providers:",
    ...Object.entries(providers).map(
      ([name, p]) => `  ${mark(p.ready)} ${name} (${p.cost}): needs ${p.needs}${p.keySource ? `; key from ${p.keySource}` : ""}`,
    ),
  ].join("\n");
  return { json: data, text };
}

// ---------- main ----------

async function main() {
  loadEnvFile();
  const { values: opts, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      max: { type: "string" },
      "min-duration": { type: "string" },
      "max-duration": { type: "string" },
      "upload-date": { type: "string" },
      lang: { type: "string" },
      provider: { type: "string" },
      json: { type: "boolean" },
      out: { type: "string" },
    },
  });
  const [command, arg] = positionals;
  if (!command || (!arg && command !== "doctor")) {
    throw new ExitError("Usage: yt.mjs <search|info|captions|transcribe> <query-or-url> [flags] | yt.mjs doctor");
  }

  let result;
  if (command === "doctor") result = await doctor();
  else if (command === "search") result = await search(arg, opts);
  else if (command === "info") result = await info(arg);
  else if (command === "captions" || command === "transcribe") {
    const t = command === "captions" ? await captions(arg, opts) : await transcribe(arg, opts);
    result = { json: t, text: transcriptMarkdown(t) };
  } else throw new ExitError(`Unknown command "${command}".`);

  const output = opts.json ? JSON.stringify(result.json, null, 2) : result.text;
  if (opts.out) {
    await writeFile(opts.out, output + "\n");
    console.log(`Wrote ${opts.out}`);
  } else console.log(output);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(err.code && Number.isInteger(err.code) ? err.code : 1);
});
