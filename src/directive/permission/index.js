import { useUserStore } from "@/store/user";

export const vPermission = {
  mounted(el, binding) {
    const { value } = binding;
    const userStore = useUserStore();

    // 获取用户权限列表
    const userRoles = userStore.permissions || [];

    // 检查指令的值是否在用户权限中
    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = userRoles.some(role => value.includes(role));
      if (!hasPermission) {
        // 没有权限，移除元素
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      console.warn(`v-permission 指令需要一个非空的数组作为值`);
    }
  },
};

// 默认导出所有指令
export default {
  permission: vPermission,
};
