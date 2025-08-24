module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "commonjs",
  },
  rules: {
    // Code quality rules
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": "off", // 允許 console.log，因為腳本需要輸出
    "prefer-const": "error",
    "no-var": "error",

    // Best practices
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    "no-eval": "error",
    "no-implied-eval": "error",

    // Comments and documentation
    "spaced-comment": ["error", "always"],
  },
  overrides: [
    {
      files: ["scripts/**/*.js"],
      rules: {
        "no-console": "off", // 腳本檔案完全允許 console
        "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // 腳本檔案降低未使用變數的嚴格度
      },
    },
    {
      files: ["**/*.worker.js", "**/sw.js", "static/**/*.js"],
      env: {
        worker: true,
        serviceworker: true,
      },
      globals: {
        self: "readonly",
        caches: "readonly",
        fetch: "readonly",
        Response: "readonly",
        URL: "readonly",
        location: "readonly",
        TextEncoder: "readonly",
      },
    },
  ],
  ignorePatterns: [
    "node_modules/",
    "public/",
    "resources/",
    "themes/hugoplate/",
    "scripts/venv/",
    "*.min.js",
  ],
};
