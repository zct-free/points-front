<template>
  <a-breadcrumb class="breadcrumb" separator="/">
    <a-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="item.name">
      <span v-if="!item.redirect || index === breadcrumbItems.length - 1" class="no-redirect">{{ item.title }}</span>
      <router-link v-else :to="item.path">
        <span v-if="item.icon" :is="item.icon" />
        {{ item.title }}
      </router-link>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="js">
import { HomeOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons-vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// 面包屑数据
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false);

  const items = [
    {
      title: "首页",
      path: "/home",
      icon: HomeOutlined,
      name: "home",
      redirect: "/home",
    },
  ];
  if (matched[0]?.path?.includes("home")) {

    return items
  }


  // 添加当前路由路径
  matched.forEach((match, index) => {
    const isLast = index === matched.length - 1;
    // 构建正确的绝对路径
    let fullPath = match.redirect ? match.redirect : match.path.startsWith("/") ? match.path : "/" + match.path;

    items.push({
      title: isLast
        ? typeof route?.query?.title === "string"
          ? route.query.title
          : match.meta.title
        : match.meta.title,
      path: isLast ? undefined : fullPath,
      icon: match.meta.icon ? getIconComponent(match.meta.icon) : undefined,
      name: match.name,
      redirect: match.redirect,
    });
  });
  return items;
});

// 获取图标组件
const getIconComponent = iconName => {
  const iconMap = {
    HomeOutlined,
    UserOutlined,
    SettingOutlined,
  };
  return iconMap[iconName] || null;
};
</script>

<style lang="less" scoped>
.breadcrumb {
  line-height: 64px;
  :deep(.ant-breadcrumb-link) {
    color: #fff !important;
    a {
      color: inherit;
    }
  }
  :deep(.ant-breadcrumb-separator) {
    color: #807d7d;
  }
}
.no-redirect {
  color: #1890ff;
}
</style>
