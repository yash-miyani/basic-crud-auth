import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Turn off specific rules
      "react-hooks/set-state-in-effect": "off",

      // Make unused variables warning (not error)
      "@typescript-eslint/no-unused-vars": "warn",

      // Disable console warning
      "no-console": "off",

      // Allow buttons without explicit type (if needed)
      "react/button-has-type": "off",

      // Allow using any
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
