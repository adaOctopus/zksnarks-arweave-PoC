import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  { ignores: ["node_modules", "dist", "cache", "artifacts", "typechain-types", "coverage", "*.js"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      globals: { console: "readonly", process: "readonly", __dirname: "readonly", module: "readonly", require: "readonly", exports: "readonly" },
    },
    plugins: { "@typescript-eslint": tseslint, prettier: prettierPlugin },
    rules: {
      ...tseslint.configs.recommended.rules,
      "prettier/prettier": "error",
    },
  },
  prettier,
];
