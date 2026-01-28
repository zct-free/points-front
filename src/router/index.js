/**
 * 路由配置数组。
 *
 * meta 字段参数说明：
 * - requiresAuth?: boolean - 是否需要登录认证才能访问该路由。
 * - title?: string         - 路由在侧边栏、标签页等处显示的标题。
 * - icon?: string          - 路由在侧边栏等处显示的图标名称（通常对应于 icon 组件）。
 * - hiddenFromMenu?:boolean -是否隐藏菜单
 *
 * 其他说明：
 * - redirect: string       - 进入该路由时自动重定向到的子路由路径（相对路径）。
 * - children: RouteRecordRaw[] - 子路由数组，用于多级菜单或嵌套路由。
 */
import AdminLayout from "@/layouts/AdminLayout.vue"; // Import the main layout
import { useUserStore } from "@/store/user.js"; // Import user store
import Cookies from "js-cookie"; // Import Cookies for token management
import { createRouter, createWebHistory } from "vue-router";
const routes = [
  {
    path: "/", // Parent route for all authenticated views
    component: AdminLayout, // Use AdminLayout as the component for this route
    redirect: "/home", // Redirect to /home by default
    children: [
      {
        path: "home",
        name: "home",
        component: () => import("@/views/Home/HomeView.vue"), // Lazy load the Home component
      },
    ],
  },
  // Fallback route for 404
  { path: "/404", name: "NotFound", component: () => import("@/views/NotFound.vue") },
];
export const asyncRoutes = [
  {
    path: "/points-account",
    name: "content",
    meta: {
      title: "积分账户",
      icon: "FileTextOutlined",
      role: ["jfzh"],
    },
    redirect: "/points-account/account-list",
    component: AdminLayout,
    children: [
      {
        path: "account-list",
        name: "content-list",
        component: () => import("@/views/points-account/account-list/index.vue"),
        meta: {
          title: "账户列表",
          icon: "EditOutlined",
          role: ["jflb"],
        },
      },
      {
        path: "account-flow",
        name: "points-account-flow",
        component: () => import("@/views/points-account/account-flow/index.vue"),
        meta: {
          title: "账户流水",
          icon: "EditOutlined",
          role: ["jfls"],
        },
      },
    ],
  },
  {
    path: "/points-ranking",
    name: "points-ranking",
    meta: {
      title: "积分排行",
      role: ["jfph"],
    },
    redirect: "/points-ranking/group-points",
    component: AdminLayout,

    children: [
      {
        path: "group-points",
        name: "group-points",
        component: () => import("@/views/points/group-points/index.vue"),
        meta: {
          title: "群组积分排行",
          role: ["qzjfph"],
        },
      },
      {
        path: "user-points",
        name: "user-points",
        component: () => import("@/views/points/user-points/index.vue"),
        meta: {
          title: "用户积分排行",
          role: ["yhjfph"],
        },
      },
    ],
  },
  {
    path: "/points-rules",
    name: "rules",
    meta: {
      title: "积分规则",
      role: ["jfgz"],
    },
    redirect: "/points-rules/rule-config",
    component: AdminLayout,

    children: [
      {
        path: "rule-config",
        name: "rule-config",
        component: () => import("@/views/rules/rule-configuration.vue"),
        meta: {
          title: "规则配置",
          role: ["gzpz"],
        },
      },
      {
        path: "rule-anti-brush",
        name: "rule-anti-brush",
        component: () => import("@/views/rules/anti-brush-algorithm.vue"),
        meta: {
          title: "防刷规则",
          role: ["fsgz"],
        },
      },
      // {
      //   path: "Step-by-step",
      //   name: "Step-by-step",
      //   component: () => import("@/views/rules/step-by-step-rules.vue"),
      //   meta: {
      //     title: "阶梯奖励规则",
      //     role: ["jtjlgz"],
      //   },
      // },
      {
        path: "user-level",
        name: "user-level",
        component: () => import("@/views/rules/user-level-rules.vue"),
        meta: {
          title: "用户等级规则",
          role: ["yhdjgz"],
        },
      },
    ],
  },
  {
    path: "/points-mall",
    name: "points-mall",
    meta: {
      title: "积分消耗",
      role: ["jfxh"],
    },
    component: AdminLayout,

    redirect: "/points-mall/goods-manage",
    children: [
      {
        path: "goods-manage",
        name: "goods-manage",
        component: () => import("@/views/points-mall/goods-manage/index.vue"),
        meta: {
          title: "商品管理",
          role: ["spgl"],
        },
      },
      {
        path: "address-manage",
        name: "address-manage",
        component: () => import("@/views/points-mall/address-manage/index.vue"),
        meta: {
          title: "收货地址管理",
          role: ["shdzgl"],
        },
      },

      {
        path: "express-manage",
        name: "express-manage",
        component: () => import("@/views/points-mall/express-manage/index.vue"),
        meta: {
          title: "快递管理",
          role: ["kdgl"],
        },
      },
      {
        path: "points-exchange",
        name: "points-exchange",
        component: () => import("@/views/points-mall/points-exchange/index.vue"),
        meta: {
          title: "积分兑换",
          role: ["jfdh"],
        },
      },
      {
        path: "points-consumption",
        name: "points-consumption",
        component: () => import("@/views/points-mall/points-consumption/index.vue"),
        meta: {
          title: "积分消耗轨迹",
        },
      },
      {
        path: "points-learning-report",
        name: "points-learning-report",
        component: () => import("@/views/points-mall/points-learn/index.vue"),
        meta: {
          title: "积分学习报表",
        },
      },
    ],
  },
  {
    path: "/points-security",
    name: "points-security",
    meta: {
      title: "积分安全",
      role: ["jfaq"],
    },
    component: AdminLayout,

    redirect: "/points-security/abnormal-monitoring",
    children: [
      {
        path: "abnormal-monitoring",
        name: "abnormal-monitoring",
        component: () => import("@/views/point-security/exception-monitoring/index.vue"),
        meta: {
          title: "实时异常监控",
          role: ["ssycjk"],
        },
      },
      {
        path: "blacklist-database",
        name: "blacklist-database",
        component: () => import("@/views/point-security/blacklist-manage/index.vue"),
        meta: {
          title: "黑名单库",
          role: ["ssycjk"],
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes.concat(asyncRoutes),
});
let hasAddedRoutes = false;

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  next();
  return;
  // 如果访问404页面，直接放行
  if (to.path === "/404") {
    next();
    return;
  }

  if (to.query?.dictValue) {
    userStore.setDictValue(to.query.dictValue);
    const obj = {
      ...to.query,
    };
    delete obj.dictValue;

    next({ path: to.path, query: obj });
  }
  const hasToken = Cookies.get("Admin-Token");

  if (hasToken) {
    try {
      if (!hasAddedRoutes) {
        userStore.fetchUserInfo();
        const accessRoutes = await userStore.generateRoutes();
        addAsyncRoutes(accessRoutes);
        await new Promise(resolve => setTimeout(resolve, 30));
        hasAddedRoutes = true;
        const matched = router.resolve(to).matched;
        if (matched.length === 0) {
          next("/404");
          return;
        }
        // 动态路由添加后，重新导航到目标路由
        next({ ...to, replace: true });
      } else {
        next();
      }
    } catch (error) {
      hasAddedRoutes = false;
      next("/404");
    }
  } else {
    hasAddedRoutes = false;
    next("/404");
  }
});

export default router;
const addAsyncRoutes = routes => {
  routes.forEach(route => {
    router.addRoute(route);
  });
};
export const resetRouterState = () => {
  hasAddedRoutes = false;
};
