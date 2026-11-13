#!/usr/bin/env node
// learning-with-ai-kit config: get, set, and unset keys in ~/.learning-with-ai-kit/config.json.
//
//   node config.mjs get            -> prints the whole config (with defaults) as JSON
//   node config.mjs get <key>      -> prints one value
//   node config.mjs set <key> <v>  -> saves a value
//   node config.mjs unset <key>    -> removes a value (falls back to default)

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const CONFIG_PATH =
  process.env.LEARNING_WITH_AI_KIT_CONFIG ?? join(homedir(), ".learning-with-ai-kit", "config.json");

const DEFAULTS = {
  vaultPath: null,
  baseFolder: "Learning",
  notesMode: null, // null means "not asked yet"; the learn skill asks once
  transcriber: "auto",
};

const ALLOWED = {
  notesMode: ["off", "on-request", "suggest"],
  transcriber: ["auto", "captions", "gemini", "elevenlabs", "openai"],
};

function load() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw new Error(`Could not read ${CONFIG_PATH}: ${err.message}`);
  }
}

function save(config) {
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

function expandPath(value) {
  if (value.startsWith("~/")) value = join(homedir(), value.slice(2));
  return resolve(value);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const [command = "get", key, value] = process.argv.slice(2);
const stored = load();

switch (command) {
  case "get": {
    const merged = { ...DEFAULTS, ...stored };
    if (!key) console.log(JSON.stringify({ ...merged, configPath: CONFIG_PATH }, null, 2));
    else if (key in merged) console.log(merged[key] ?? "");
    else fail(`Unknown key "${key}". Keys: ${Object.keys(DEFAULTS).join(", ")}`);
    break;
  }
  case "set": {
    if (!(key in DEFAULTS)) fail(`Unknown key "${key}". Keys: ${Object.keys(DEFAULTS).join(", ")}`);
    if (value === undefined) fail(`Usage: config.mjs set ${key} <value>`);
    if (ALLOWED[key] && !ALLOWED[key].includes(value)) {
      fail(`Invalid ${key} "${value}". Allowed: ${ALLOWED[key].join(", ")}`);
    }
    stored[key] = key === "vaultPath" ? expandPath(value) : value;
    save(stored);
    console.log(`${key} = ${stored[key]}`);
    break;
  }
  case "unset": {
    delete stored[key];
    save(stored);
    console.log(`${key} reset to default`);
    break;
  }
  default:
    fail("Usage: config.mjs get [key] | set <key> <value> | unset <key>");
}
