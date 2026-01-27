<template>
  <a-menu-item v-if="!hasChildren" :key="`${route.name?.toString() || route.path}`">
    <router-link :to="getRoutePath()">
      <span>{{ route.meta?.title || route.name }}</span>
    </router-link>
  </a-menu-item>

  <a-sub-menu v-else :key="route.name?.toString() || route.path">
    <template #title>
      <span>{{ route.meta?.title || route.name }}</span>
    </template>
    <menu-item v-for="child in visibleChildren" :key="child.name || child.path" :route="child" :icons="icons" />
  </a-sub-menu>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  route: {
    type: Object,
    required: true,
  },
  icons: {
    type: Object,
    default: () => ({}),
  },
});

// 计算是否有可见的子菜单
const hasChildren = computed(() => {
  return props.route.children && props.route.children.length > 0 && visibleChildren.value.length > 0;
});

// 过滤可见的子菜单
const visibleChildren = computed(() => {
  if (!props.route.children) return [];
  return props.route.children.filter(child => child.meta && child.meta.title && !child.meta.hiddenFromMenu);
});

// 获取路由路径
const getRoutePath = () => {
  // 如果有重定向，使用重定向路径
  if (props.route.redirect && typeof props.route.redirect === "string") {
    return props.route.redirect;
  }
  // 如果有重定向对象，使用其name
  if (props.route.redirect && typeof props.route.redirect === "object" && "name" in props.route.redirect) {
    return { name: props.route.redirect.name };
  }
  // 否则使用路由名称
  if (props.route.name) {
    return { name: props.route.name };
  }
  // 最后使用路径
  return props.route.path;
};
</script>

<style lang="less" scoped>
// 子菜单样式可以在这里自定义
:deep(.ant-menu-submenu-title) {
  .anticon {
    margin-right: 8px;
  }
}

:deep(.ant-menu-item) {
  .anticon {
    margin-right: 8px;
  }
}
</style>
