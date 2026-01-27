import vue from "@vitejs/plugin-vue";

export function createVitePlugins(viteEnv, isBuild) {
  const vitePlugins = [];

  vitePlugins.push(
    vue({
      script: {
        defineModel: true, // 启用 defineModel 支持
      },
    })
  );

  return vitePlugins;
}
