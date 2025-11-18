const js = require("@eslint/js");
const globals = require("globals");

const defineConfig = (configs) => configs; // align with ESLint defineConfig helper

module.exports = defineConfig([
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script"
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  {
    files: ["MMM-nest.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        Module: "readonly",
        Log: "readonly"
      }
    }
  },
  {
    files: ["node_helper.js"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs"
    }
  }
]);
