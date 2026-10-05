import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { NextRequest } = require("next/server");

function loadModule(path, dependencies = require) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  });
  const exports = {};
  runInNewContext(outputText, { exports, require: dependencies, URL, atob });
  return exports;
}

const session = loadModule("src/lib/session.ts");
const { proxy } = loadModule("src/proxy.ts", (name) => name === "@/lib/session" ? session : require(name));
const roles = ["admin", "docente", "estudiante"];

function request(path, role) {
  const headers = {};
  if (role) {
    const payload = Buffer.from(JSON.stringify({
      sub: "test-user", email: "test@example.com", role, exp: Math.floor(Date.now() / 1000) + 3600,
    })).toString("base64url");
    headers.cookie = `${session.COOKIE}=test.${payload}.test`;
  }
  return proxy(new NextRequest(`http://localhost:3001${path}`, { headers }));
}

test("FE-029: other roles' roots and descendants redirect to the user's home", () => {
  for (const role of roles) {
    for (const area of roles.filter((area) => area !== role)) {
      for (const path of [`/${area}`, `/${area}/`, `/${area}/usuarios`, `/${area}/grupos/test`]) {
        const response = request(path, role);
        assert.equal(response.status, 307, `${role}: ${path}`);
        assert.equal(response.headers.get("location"), `http://localhost:3001${session.HOME[role]}`);
      }
    }
  }
});

test("FE-029: own area, common pages and unrelated prefixes remain accessible", () => {
  for (const role of roles) {
    for (const path of [`/${role}`, `/${role}/`, `/${role}/grupos/test`, "/cuenta", "/notificaciones", "/administrativo", "/docentes", "/estudiantes"]) {
      const response = request(path, role);
      assert.equal(response.headers.get("x-middleware-next"), "1", `${role}: ${path}`);
      assert.equal(response.headers.get("location"), null);
    }
  }
});

test("FE-029: session requirements and login redirects are preserved", () => {
  for (const path of ["/admin/usuarios", "/docente/grupos/test", "/estudiante", "/cuenta"]) {
    assert.equal(request(path).headers.get("location"), "http://localhost:3001/login");
  }
  assert.equal(request("/login").headers.get("x-middleware-next"), "1");
  for (const role of roles) {
    assert.equal(request("/login", role).headers.get("location"), `http://localhost:3001${session.HOME[role]}`);
    assert.equal(request("/login?expired=1", role).headers.get("x-middleware-next"), "1");
  }
});
