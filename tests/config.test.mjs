import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const script = new URL("../skills/learn/scripts/config.mjs", import.meta.url).pathname;

function config(dir, ...args) {
  return execFileSync("node", [script, ...args], {
    env: { ...process.env, LEARNING_WITH_AI_KIT_CONFIG: join(dir, "config.json") },
    encoding: "utf8",
  }).trim();
}

test("returns defaults when no config exists", () => {
  const dir = mkdtempSync(join(tmpdir(), "lk-"));
  try {
    const all = JSON.parse(config(dir, "get"));
    assert.equal(all.baseFolder, "Learning");
    assert.equal(all.notesMode, null);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("sets, reads, and unsets a value", () => {
  const dir = mkdtempSync(join(tmpdir(), "lk-"));
  try {
    config(dir, "set", "notesMode", "suggest");
    assert.equal(config(dir, "get", "notesMode"), "suggest");
    config(dir, "unset", "notesMode");
    assert.equal(config(dir, "get", "notesMode"), "");
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test("rejects invalid values", () => {
  const dir = mkdtempSync(join(tmpdir(), "lk-"));
  try {
    assert.throws(() => config(dir, "set", "notesMode", "always"));
    assert.throws(() => config(dir, "set", "nope", "x"));
  } finally {
    rmSync(dir, { recursive: true });
  }
});
