import test from "node:test";
import assert from "node:assert/strict";
import { compareSemver } from "../src/lib/semver.ts";

test("Semver Comparison: Identifies newer versions correctly", () => {
  assert.equal(compareSemver("1.0.1", "1.0.0"), 1);
  assert.equal(compareSemver("v1.1.0", "1.0.9"), 1);
  assert.equal(compareSemver("2.0.0", "1.99.99"), 1);
  assert.equal(compareSemver("1.0.0.1", "1.0.0"), 1);
});

test("Semver Comparison: Identifies identical versions correctly", () => {
  assert.equal(compareSemver("1.0.0", "1.0.0"), 0);
  assert.equal(compareSemver("v1.0.0", "1.0.0"), 0);
  assert.equal(compareSemver("v2.3.4", "v2.3.4"), 0);
});

test("Semver Comparison: Identifies older versions correctly", () => {
  assert.equal(compareSemver("1.0.0", "1.0.1"), -1);
  assert.equal(compareSemver("0.9.9", "1.0.0"), -1);
  assert.equal(compareSemver("v1.0.0", "1.1.0"), -1);
});
