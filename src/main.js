import "@/style/common.less";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.less"; // 引入 Less 文件以支持主题定制
import { createApp } from "vue";
import App from "./App.vue";
import { setupDirectives } from "./directive/index.js";
import router from "./router/index.js";
import pinia from "./store/index.js";
import casPlugin from "./utils/casPlugin.js";

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Antd);
app.use(casPlugin);

// 注册全局指令
setupDirectives(app);

app.mount("#app");
