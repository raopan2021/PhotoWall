import antfu from "@antfu/eslint-config";

export default antfu({
  formatters: true,
  unocss: true,
  react: true,
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  stylistic: {
    quotes: "double", // 使用双引号
    semi: true, // 禁止分号
  },
});
