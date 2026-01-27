<template>
  <a-layout-header class="app-header">
    <div class="header-right">
      <BreadCrumb />

      <div class="user-info">
        <div>你好,{{ userStore?.userName }}</div>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="js">
import BreadCrumb from "@/components/Layout/BreadCrumb.vue";
import { useUserStore } from "@/store/user";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();

const handleLogout = async () => {
  try {
    await userStore.logout();
    message.success("已成功退出登录");
    router.push({ name: "login" });
  } catch (error) {
    console.error("退出登录失败:", error);
    message.error("退出登录失败");
  }
};
</script>

<style lang="less" scoped>
.app-header {
  color: white;
  padding-right: 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  // background-color: @primary-color; // 使用主题色
}

.header-right {
  display: flex;
  justify-content: space-between;
  .user-info {
    color: #fff;
    display: flex;
    align-items: center;
    gap: 20px;
    .logout {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      .logout-icon {
        font-size: 20px;
      }
    }
  }
}

:deep(.ant-dropdown-menu) {
  .ant-menu-item {
    &:hover {
      background-color: #f5f5f5;
    }
  }
}
</style>
