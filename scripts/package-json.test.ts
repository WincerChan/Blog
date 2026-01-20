import { expect, test } from "bun:test";
import pkg from "../package.json";

test("root package.json includes typescript in devDependencies", () => {
  expect(pkg.devDependencies?.typescript).toBeTruthy();
});

test("root package.json defines workspace build hooks", () => {
  expect(pkg.scripts?.["packages:build"]).toBeTruthy();
  expect(pkg.scripts?.postinstall).toBeTruthy();
});
