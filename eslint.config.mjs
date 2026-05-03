import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
    {
        ignores: [
            "**/.*",
            ".next/**",
            "node_modules/**",
            "dist/**",
            "build/**",
            "public/**",
            "playwright-report/**",
            "test-results/**"
        ]
    },
    js.configs.recommended,
    {
        files: ["**/*.jsx", "**/*.tsx", "**/*.js", "**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                React: "writable", // Add React to globals for Next.js automatic JSX transform
            },
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true
                }
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "no-console": ["warn", { "allow": ["error"] }],
        },
    },
    {
        files: ["**/*.jsx", "**/*.tsx", "**/*.js", "**/*.ts"],
        plugins: {
            "react": reactPlugin,
            "react-hooks": reactHooksPlugin,
            "@next/next": nextPlugin,
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            "react/react-in-jsx-scope": "off",
            "react/no-unescaped-entities": "off",
            "react-hooks/exhaustive-deps": "off",
            "react-hooks/rules-of-hooks": "error",
            "@next/next/no-img-element": "warn",
            "@next/next/no-html-link-for-pages": "off"
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    }
];
