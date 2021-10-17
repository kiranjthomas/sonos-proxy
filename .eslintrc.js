module.exports = {
  env: {
    node: true,
    es6: true,
    es2017: true,
    es2020: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "prettier/prettier": "error",
  },
};
