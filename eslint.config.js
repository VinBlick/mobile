const { readdirSync, existsSync } = require("node:fs");
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

/**
 * Feature-Sliced Design: app (src/app routes + src/providers) → screens →
 * widgets → features → entities → shared. Lower layers never import upper ones,
 * slices of one layer stay independent (entities may share types).
 */
const LAYERS = ["screens", "widgets", "features", "entities", "shared"];
const SLICED = ["screens", "widgets", "features", "entities"];
const slicesOf = (layer) =>
  existsSync(`src/${layer}`)
    ? readdirSync(`src/${layer}`, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [];

const rules = LAYERS.flatMap((layer, index) => {
  const upper = ["app", "providers", ...LAYERS.slice(0, index)].map((l) => ({
    group: [`@/${l}`, `@/${l}/**`],
    message: `"${layer}" must not import from the upper layer "${l}".`,
  }));
  const deep = SLICED.filter((l) => l !== layer).map((l) => ({
    group: [`@/${l}/*/**`],
    message: "Import other slices through their public API (index.ts).",
  }));
  if (!SLICED.includes(layer))
    return [{ files: [`src/${layer}/**/*.{ts,tsx}`], rules: { "@typescript-eslint/no-restricted-imports": ["error", { patterns: [...upper, ...deep] }] } }];
  const slices = slicesOf(layer);
  return slices.map((slice) => ({
    files: [`src/${layer}/${slice}/**/*.{ts,tsx}`],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            ...upper,
            ...deep,
            ...slices
              .filter((s) => s !== slice)
              .map((s) => ({
                group: [`@/${layer}/${s}`, `@/${layer}/${s}/**`],
                message: `Slices of "${layer}" must stay independent.`,
                allowTypeImports: layer === "entities",
              })),
          ],
        },
      ],
    },
  }));
});

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/*", ".expo/*", "node_modules/*"] },
  ...rules,
]);
