import eslintJs from "@eslint/js";
import eslintPrettier from "eslint-config-prettier/flat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import eslintTs from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default eslintTs.config(
    { ignores: ["src/typings"] },
    eslintJs.configs.recommended,
    eslintTs.configs.recommendedTypeChecked,
    eslintPrettier,
    {
        languageOptions: {
            parser: eslintTs.parser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                project: "./tsconfig.json"
            }
        },

        rules: {
            "@typescript-eslint/naming-convention": "error",
            "@typescript-eslint/no-explicit-any": "off",
            curly: "error",
            "no-throw-literal": "error",
            "no-warning-comments": "warn",
            eqeqeq: [
                "error",
                "always",
                {
                    null: "never"
                }
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ]
        }
    }
);
