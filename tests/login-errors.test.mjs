import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { outputText } = ts.transpileModule(
  readFileSync(new URL("../src/lib/api.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } },
);

function client(response) {
  const exports = {};
  const location = { href: "/login" };
  const calls = [];
  runInNewContext(outputText, {
    exports,
    window: { location },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return response;
    },
  });
  return { ...exports, location, calls };
}

test("FE-016: invalid login credentials return the authentication error without navigation", async () => {
  const { api, ApiError, location, calls } = client(
    Response.json({ message: "Credenciales invalidas" }, { status: 401 }),
  );
  const credentials = { email: "test@example.test", password: "test-only" };
  await assert.rejects(api("/auth/login", { method: "POST", body: credentials }), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 401);
    assert.equal(error.message, "Credenciales invalidas");
    return true;
  });
  assert.equal(location.href, "/login");
  assert.equal(calls[0].url, "/api/auth/login");
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.body, JSON.stringify(credentials));
});

test("FE-016: a protected resource still redirects on an expired session", async () => {
  const { api, ApiError, location } = client(
    Response.json({ message: "Unauthorized" }, { status: 401 }),
  );
  await assert.rejects(api("/users/me"), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 401);
    assert.equal(error.message, "Sesion vencida");
    return true;
  });
  assert.equal(location.href, "/login?expired=1");
});

test("FE-016: a successful login still returns the destination", async () => {
  const { api, location } = client(Response.json({ role: "admin", home: "/admin" }));
  const result = await api("/auth/login", { method: "POST", body: {} });
  assert.equal(result.role, "admin");
  assert.equal(result.home, "/admin");
  assert.equal(location.href, "/login");
});
