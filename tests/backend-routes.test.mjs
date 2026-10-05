import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const origin = "http://backend.test:3000";
const token = "test-token";

function loadModule(path, dependencies, fetch) {
  const filename = fileURLToPath(new URL(`../${path}`, import.meta.url));
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    fileName: filename,
  });
  const exports = {};
  runInNewContext(outputText, {
    exports,
    process: { env: { BACKEND_URL: origin } },
    fetch,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename });
  return exports;
}

test("FE-001: login, server-side reads and proxy use the versioned backend routes", async (t) => {
  const calls = [];
  let backendResponse;
  const fetch = async (url, options) => {
    calls.push({ url, options });
    return backendResponse;
  };
  const jar = { get: () => ({ value: token }) };
  const session = { COOKIE: "session" };
  const server = loadModule("src/lib/server.ts", {
    "next/headers": { cookies: async () => jar },
    "next/navigation": { redirect: () => assert.fail("Unexpected redirect") },
    "./session": session,
  }, fetch);
  const dependencies = {
    "@/lib/server": server,
    "@/lib/session": session,
    "next/server": { NextResponse: Response },
  };

  await t.test("login preserves POST and credentials", async () => {
    const login = loadModule("src/app/api/auth/login/route.ts", dependencies, fetch);
    const body = JSON.stringify({ email: "test@example.test", password: "test-only" });
    backendResponse = Response.json({ message: "Invalid credentials" }, { status: 401 });
    const response = await login.POST({ text: async () => body });
    assert.equal(response.status, 401);
    const { url, options } = calls.pop();
    assert.equal(url, `${origin}/api/v1/auth/login`);
    assert.equal(options.method, "POST");
    assert.equal(options.body, body);
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.cache, "no-store");
  });

  await t.test("server-side reads preserve Authorization", async () => {
    backendResponse = Response.json({ name: "Test" });
    assert.equal((await server.apiGet("/users/me")).name, "Test");
    const { url, options } = calls.pop();
    assert.equal(url, `${origin}/api/v1/users/me`);
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    assert.equal(options.cache, "no-store");
  });

  await t.test("proxy preserves method, body, query and Authorization", async () => {
    const proxy = loadModule("src/app/api/[...path]/route.ts", dependencies, fetch);
    const body = JSON.stringify({ name: "Test" });
    backendResponse = Response.json({ ok: true });
    const response = await proxy.PATCH({
      method: "PATCH", cookies: jar,
      nextUrl: new URL("http://frontend.test/api/users/me?include=a%2Fb&page=2"),
      text: async () => body,
    }, { params: Promise.resolve({ path: ["users", "me"] }) });
    assert.equal(response.status, 200);
    const { url, options } = calls.pop();
    assert.equal(url, `${origin}/api/v1/users/me?include=a%2Fb&page=2`);
    assert.equal(options.method, "PATCH");
    assert.equal(options.body, body);
    assert.equal(options.headers.Authorization, `Bearer ${token}`);
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.cache, "no-store");
  });
});
