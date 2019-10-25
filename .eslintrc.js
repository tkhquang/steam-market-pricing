module.exports = {
  root: true,
  parser:  "@typescript-eslint/parser",
  extends: [
    "standard",
    "plugin:prettier/recommended",
    "prettier",
    "prettier/standard",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint"
  ],
  plugins: [
    "prettier",
    "standard",
  ],
  parserOptions: {
    sourceType: "module",
    ecmaVersion:  2018,
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    }
  },
  "env": {
    "node": true,
    "commonjs": true,
    "es6": true
  },
  rules: {
    camelcase: "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": [
      "error",
      {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
        trailingComma: "none",
        bracketSpacing: true,

        "comma-dangle": ["error", "always"],
        "no-cond-assign": ["error", "always"],
        "no-console": "off"
      },
    ],
  },
};

