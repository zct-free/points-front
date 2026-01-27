import path from "path";
import { defineConfig, loadEnv } from "vite";
import { createVitePlugins } from "./build/plugin/index.js";

export default defineConfig(({ mode, command }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root, "");
  const isBuild = command === "build";
  const isProduction = mode === "production";
  return {
    root,
    base: "/points-system/",
    plugins: createVitePlugins(env, isBuild),
    server: {
      host: true,
      open: true,
      port: 2003,
      // proxy: {
      //   // 代理所有 /api 开头的请求
      //   "/api": {
      //     target: VITE_API_URL,
      //     changeOrigin: true,
      //     // 重写路径，去掉 /api 前缀
      //     rewrite: path => path.replace(/^\/api/, ""),
      //   },
      //   // 如果还需要代理其他路径，可以添加更多配置
      //   "/bonc-feeds": {
      //     target: VITE_API_URL,
      //     changeOrigin: true,
      //   },
      // },
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: path.resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "@/style/variables.less";`, // 引入全局变量
          modifyVars: {
            // 直接在这里定义主题变量
            // "@primary-color": "#d90b0b",
            // "@link-color": "#d90b0b",
            // "@success-color": "#52c41a",
            // "@warning-color": "#faad14",
            // "@error-color": "#f5222d",
            // "@font-size-base": "14px",
            // "@heading-color": "rgba(0, 0, 0, 0.85)",
            // "@text-color": "rgba(0, 0, 0, 0.65)",
            // "@text-color-secondary": "rgba(0, 0, 0, 0.45)",
            // "@disabled-color": "rgba(0, 0, 0, 0.25)",
            // "@border-radius-base": "2px",
            // "@border-color-base": "#d9d9d9",
          },
        },
      },
    },
    esbuild: {
      drop: isProduction ? ["console", "debugger"] : [],
    },
    // Configure build options
    build: {
      minify: "esbuild",
      target: "es2015",
      cssTarget: "chrome80",
      cssMinify: "esbuild",
      sourcemap: isProduction ? false : "inline",
      outDir: "points-front",
      rollupOptions: {
        output: {
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          manualChunks: {
            // 将Vue相关库分离到单独的chunk
            vue: ["vue", "vue-router", "pinia"],
            // 将UI库分离（如果使用Element Plus、Ant Design等）
            ui: ["ant-design-vue", "@ant-design/icons-vue"],
            // 将工具库分离
            utils: ["lodash-es", "dayjs", "axios"],
          },
        },
      },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
    },
    optimizeDeps: {
      include: ["ant-design-vue", "vue", "vue-router", "@vue/runtime-core", "@vue/runtime-dom", "lodash-es", "dayjs"],
    },
  };
});
