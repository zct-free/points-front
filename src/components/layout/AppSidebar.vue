<template>
  <a-layout-sider width="220" class="app-sidebar" v-model:collapsed="collapsed">
    <div class="sidebar-content">
      <div class="header-title">积分管理系统</div>
      <a-menu mode="inline" v-model:selectedKeys="state.selectedKeys" theme="dark" v-if="menuRoutes.length">
        <template v-for="route in menuRoutes" :key="route.name">
          <menu-item :route="route" :icons="icons" />
        </template>
      </a-menu>
    </div>
  </a-layout-sider>
</template>

<script setup>
import { useUserStore } from "@/store/user.js";
import {
  AppstoreOutlined,
  EditOutlined,
  FileTextOutlined,
  HomeOutlined,
  LockOutlined,
  PictureOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons-vue";
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import MenuItem from "./MenuItem.vue";

const userStore = useUserStore();
const route = useRoute();

// Icons available for dynamic rendering
const icons = {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  LockOutlined,
  FileTextOutlined,
  EditOutlined,
  AppstoreOutlined,
  PictureOutlined,
  VideoCameraOutlined,
};

const collapsed = ref(false);

const menuRoutes = computed(() => {
  const processRoutes = routes => {
    return routes
      .map(routeItem => {
        // 如果路由有children且只有一个子菜单，且子菜单的hiddenFromMenu不为false
        if (routeItem.children && routeItem.children.length === 1) {
          const child = routeItem.children[0];
          if (child.meta && child.meta.title && !child.meta.hiddenFromMenu) {
            // 返回子菜单，但保持父级的一些属性
            return {
              ...child,
              path: routeItem.path + "/" + child.path,
              meta: {
                ...child.meta,
                // 如果父级有图标而子级没有，使用父级图标
                icon: child.meta.icon || routeItem.meta?.icon,
              },
            };
          }
        }
        // 其他情况按现在的逻辑处理
        return routeItem;
      })
      .filter(routeItem => {
        return routeItem.meta && routeItem.meta.title && !routeItem.meta.alwaysShow && !routeItem.meta.hiddenFromMenu;
      });
  };

  return processRoutes(userStore.routes || []);
});
const state = reactive({
  openKeys: [],
  selectedKeys: [],
  rootSubmenuKeys: [],
});

// 根据当前路由设置菜单选中状态
const setSelectedKeys = () => {
  const currentPath = route.path;
  const currentName = route.name || "";

  // 找到匹配的路由
  const findMatchedRoute = (routes, targetPath) => {
    for (const routeItem of routes) {
      if (routeItem.path === targetPath || routeItem.name === currentName) {
        return [String(routeItem.name)];
      }
      if (routeItem.children) {
        const childMatch = findMatchedRoute(routeItem.children, targetPath);
        if (childMatch.length > 0) {
          return childMatch;
        }
      }
    }
    return [];
  };

  const matched = findMatchedRoute(menuRoutes.value, currentPath);
  state.selectedKeys = matched;
};

// 监听路由变化，更新菜单选中状态
watch(
  () => route.path,
  () => {
    setSelectedKeys();
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.logo {
  height: 32px;
  color: #fff;
  margin: 16px;

  text-align: center;
  line-height: 30px;
  font-size: 18px;
}

.app-sidebar {
  // 侧边栏自定义样式
  // background-color: #fff;
  // 滚动条轨道
  height: 100%;
  overflow: auto;
  .sidebar-content {
    height: 100%;
    padding-bottom: 20px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  // 滑块
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }

  .ant-menu {
    border-right: none;
  }

  .ant-menu-item {
    a {
      text-decoration: none;
      display: flex;
      align-items: center;
      .anticon {
        margin-right: 8px;
      }
    }
  }

  .ant-menu-submenu-title {
    .anticon {
      margin-right: 8px;
    }
  }
  .header-title {
    color: white;
    font-size: 18px;
    font-weight: bold;
    padding: 16px;
    text-align: center;
  }
}
</style>
