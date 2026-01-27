// Pinia Store 配置
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

// 创建 pinia 实例
const pinia = createPinia();

// 配置持久化插件
pinia.use(
  createPersistedState({
    // 配置选项
    storage: localStorage, // 使用 localStorage 作为存储
    auto: true, // 不自动开启持久化，需要在 store 中单独配置
  })
);

// 开发环境下添加调试插件
if (import.meta.env.DEV) {
  pinia.use(({ store }) => {
    // 添加调试信息
    store.$subscribe(mutation => {
      console.log("🔄 Store mutation:", mutation.type, mutation.storeId);
    });
  });

  // 在开发环境下可以在浏览器控制台中访问 pinia
  window.__PINIA__ = pinia;
}

export default pinia;
