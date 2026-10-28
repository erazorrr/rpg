import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  transform: {
    ...tsJestTransformCfg,
  },
};
