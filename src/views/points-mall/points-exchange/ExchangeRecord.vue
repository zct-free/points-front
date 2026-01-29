<template>
  <a-modal v-model:visible="visible" title="兑换记录" width="1000px" :footer="null" @cancel="visible = false">
    <a-table :columns="columns" :dataSource="data" :pagination="false" bordered :loading="loading" :scroll="{ y: 500 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <div style="display: flex; gap: 8px">
            <a-input @change="saveNo($event, record)" />
            <a-button @click="handleSave(record)">保存</a-button>
          </div>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>
<script setup>
import { message } from "ant-design-vue";
import { ref } from "vue";
const selectRecord = defineProps({
  selectRecord: {
    type: Object,
  },
});
const visible = defineModel("visible");
const data = ref([
  {
    orderNo: "DH202309010001",
    userName: "张三",
    phone: "13800138000",
    address: "北京市朝阳区XX路XX号",
    status: "已发货",
    courierNo: "YD123456789CN",
  },
  {
    orderNo: "DH202309010002",
    userName: "李四",
    phone: "13900139000",
    address: "上海市浦东新区XX路XX号",
    status: "未发货",
    courierNo: "",
  },
]);
const loading = ref(false);
const columns = [
  {
    title: "兑换编号",
    dataIndex: "orderNo",
    ellipsis: true,
    key: "orderNo",
  },
  {
    title: "用户",
    dataIndex: "userName",
    key: "userName",
  },
  {
    title: "电话",
    dataIndex: "pointsConsume",
    key: "pointsConsume",
  },
  {
    title: "地址",
    dataIndex: "orderStatus",
    key: "orderStatus",
    ellipsis: true,
  },
  {
    title: "发货状态",
    key: "status",
    dataIndex: "status",
  },
  {
    title: "快递单号",
    key: "operation",
    width: "25%",
  },
];
const saveNo = (e, record) => {
  const value = e.target?.value?.trim();
  if (!value) return message.warning("请输入快递单号");
};
</script>
