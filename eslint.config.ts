import eslintJs from "@eslint/js";
import eslintPrettier from "eslint-config-prettier/flat";
import eslintTs from "typescript-eslint";

export default eslintTs.config(
    eslintJs.configs.recommended,
    eslintTs.configs.recommendedTypeChecked,
    eslintPrettier,
    {
        languageOptions: {
            parser: eslintTs.parser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },

        rules: {
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/naming-convention": "error",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "no-warning-comments": "warn",
            curly: "error",
            eqeqeq: [
                "error",
                "always",
                {
                    null: "never",
                },
            ],
        },
    },
    {
        files: ["eslint.config.ts", "src/typings/**/*"],
        extends: [eslintTs.configs.disableTypeChecked],
    },
);
