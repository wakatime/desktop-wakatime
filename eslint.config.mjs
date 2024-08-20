import globals from "globals";
import reactRefresh from "eslint-plugin-react-refresh";
import tsParser from "@typescript-eslint/parser";

export default [
    {
        ignores: ["**/dist", "**/dist-electron", "**/dist-web", "**/node_modules"],
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
        plugins: {
            "react-refresh": reactRefresh,
        },
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            globals: {
                ...globals.browser,
            },
            parser: tsParser,
        },
        rules: {
            "react-refresh/only-export-components": ["warn", {
                allowConstantExport: true,
            }],
            "no-unused-vars": ["error", {
                vars: "all",
                args: "after-used",
                caughtErrors: "all",
                ignoreRestSiblings: false,
                reportUsedIgnorePattern: false,
            }],
        },
    },
];