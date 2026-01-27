<template>
  <a-config-provider v-bind="appConfigProvider">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn"; // Import Chinese locale for dayjs
dayjs.locale("zh-cn"); // Set dayjs locale to Chinese
const getPopupContainer = (triggerNode) => {
  return triggerNode.parentNode || document.body;
};
const appConfigProvider = {
  getPopupContainer() {
    return getPopupContainer(document.body);
  },
  locale: zhCN, // Set the locale to Chinese
};
</script>

<style lang="less"></style>
