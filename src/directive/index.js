// 导入所有directive文件夹下的指令并导出

import { vLoading } from "./loading/index.js";

// 所有指令的集合
const directives = {
  loading: vLoading,
};

// 批量注册指令的安装函数
export const setupDirectives = app => {
  Object.keys(directives).forEach(key => {
    app.directive(key, directives[key]);
  });
};

// 导出单个指令
export { vLoading };

// 默认导出所有指令
export default directives;
