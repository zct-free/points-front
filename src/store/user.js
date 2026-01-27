// 用户管理 Store
import { asyncRoutes, resetRouterState } from "@/router/index.js";
import { get } from "@/utils/request.js";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

import { getMenusApi } from "@/api/index";
import { getUserInfoApi } from "@/api/login/index";
export const useUserStore = defineStore("points-user", {
  state: () => ({
    token: Cookies.get("Admin-Token") || "",
    userInfo: null,
    loading: false,
    permissions: [],
    routes: [...asyncRoutes],
    pointsDictValue: "",
  }),

  getters: {
    isLoggedIn: state => !!state.token,
    userName: state => state.userInfo?.userName || "",
    userRole: state => state.userInfo?.role || "",
    hasPermission: state => permission => {
      return state.permissions.indexOf(permission) !== -1;
    },
    permissionRoutes: state => {
      return state.routes;
    },
  },
  actions: {
    async login(params) {
      this.loading = true;
      try {
        const mockResponse = {
          token: "mock-jwt-token-" + Date.now(),
          user: {
            id: 1,
            name: "Admin User",
            username: "admin",
            email: "admin@example.com",
            avatar: "",
            role: "admin",
            status: "active",
            lastLoginTime: new Date().toISOString(),
          },
        };

        // 保存 token
        this.token = mockResponse.token;
        localStorage.setItem("token", mockResponse.token);

        // 保存用户信息
        this.userInfo = mockResponse.user;
        // 设置模拟权限
        this.permissions = ["read", "write", "admin"];

        return mockResponse;
      } catch (error) {
        console.error("登录失败:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        // 可选：调用后端登出接口
        // const { request } = post("/api/auth/logout");
        // await request;
      } catch (error) {
        console.error("登出请求失败:", error);
      } finally {
        // 清除本地数据
        this.token = "";
        this.userInfo = null;
        this.permissions = [];
        localStorage.clear();
        // 重置路由状态
        resetRouterState();
      }
    },

    async fetchUserInfo() {
      if (!this.token) return null;

      try {
        const res = await getUserInfoApi();
        this.userInfo = { ...res?.user };
      } catch (error) {}
    },

    async fetchPermissions() {
      if (!this.token) return [];

      try {
        const { request } = get("/api/user/permissions");
        const perms = await request;
        this.permissions = perms;
        return perms;
      } catch (error) {
        console.error("获取权限失败:", error);
        return [];
      }
    },
    async generateRoutes() {
      try {
        if (!this.pointsDictValue) return [];
        const res = await getMenusApi({ menuId: this.pointsDictValue });

        const roles = getAsycMenus(res?.data.children || []);
        // const roles = getAsycMenus(asyncRoutes || []);

        const accessRoutes = filterAsyncRoutes(asyncRoutes || [], roles);
        this.routes = accessRoutes; // 保存到状态中
        this.permissions = roles;
        return accessRoutes;
      } catch (error) {
        console.error("获取菜单路由失败:", error);
        // 返回空数组而不是抛出错误，避免路由守卫重定向到登录页
        return [];
      }
    },
    setDictValue(dictValue) {
      // 设置字典值到本地存储
      this.pointsDictValue = dictValue;
    },
    // 重置状态
    $reset() {
      this.token = "";
      this.userInfo = null;
      this.loading = false;
      this.permissions = [];
      this.routes = [];
      // 清除本地存储
      localStorage.clear();
      resetRouterState();
      localStorage.removeItem("token");
    },
  },
});

const filterAsyncRoutes = (routes, roles) => {
  const res = [];
  routes.forEach(route => {
    const tmp = { ...route };
    if (hasPermission(tmp, roles)) {
      if (tmp.children && tmp.children.length > 0) {
        tmp.children = filterAsyncRoutes(tmp.children, roles);
      }
      res.push(tmp);
    }
  });
  return res;
};

const hasPermission = (route, roles) => {
  if (route.meta && route.meta.role) {
    return roles.some(role => route.meta.role.includes(role));
  }
  return true; // 如果没有设置角色，则默认允许访问
};
const getAsycMenus = list => {
  return list.reduce((acc, item) => {
    if (item?.children && item?.children?.length > 0) {
      acc.push(...getAsycMenus(item.children));
    }
    acc.push(item.path);
    return acc;
  }, []);
};
