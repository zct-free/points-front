<template>
  <div>
    <div class="search-form">
      <a-form :model="filters" :wrapper-col="{ span: 16 }">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="用户名">
              <a-input v-model:value="filters.nickName" placeholder="请输入用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="消耗类型">
              <DictSelect
                dictType="points_consumption_type"
                defaultOption="全部类型"
                v-model:value="filters.consumptionType"
              >
              </DictSelect>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="时间范围">
              <a-range-picker v-model:value="filters.time" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>

          <a-col :span="6">
            <a-form-item>
              <div class="search-form-btns">
                <a-button type="primary" @click="fetchData">查询</a-button>
                <a-button @click="reset">重置</a-button>
                <a-button type="primary" @click="exportData">导出数据</a-button>
              </div>
            </a-form-item></a-col
          >

          <a-col :span="8"></a-col>
        </a-row>
      </a-form>
    </div>
    <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="tableLoading" />
  </div>
</template>
<script setup>
import { getPointsConsumptionLogs } from "@/api/goods/index";
import { useDictStore } from "@/store/dict.js";
import { onMounted, ref } from "vue";
const distStore = useDictStore();
const learningTypeMap = distStore.getDictMap("points_consumption_type");
const filters = ref({ nickName: null, consumptionType: null, time: null });

const dataSource = ref([]);

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: total => `共 ${total} 条记录`,
  showSizeChanger: true,
  onChange: (p, ps) => {
    page.value.current = p;
    pageSize.value = ps;
    fetchData();
  },
});
const tableLoading = ref(false);

const reset = () => {
  filters.value = { nickName: null, consumptionType: null, time: null };
  pagination.value.current = 1;
  fetchData();
};

const columns = [
  { title: "记录ID", dataIndex: "streamNo", key: "streamNo", ellipsis: true },
  { title: "用户名", dataIndex: "nickName", key: "nickName" },
  {
    title: "消耗类型",
    dataIndex: "consumptionType",
    key: "consumptionType",
    customRender: ({ text }) => (text ? learningTypeMap[text] : ""),
  },
  {
    title: "消耗积分",
    dataIndex: "changeNum",
    key: "changeNum",
  },
  { title: "消耗前余额", dataIndex: "beforePoints", key: "beforePoints" },
  { title: "消耗后余额", dataIndex: "afterPoints", key: "afterPoints" },
  {
    title: "关联信息",
    dataIndex: "relationInfo",
    key: "relationInfo",
  },
  { title: "消耗时间", dataIndex: "createTime", key: "createTime" },
  // {
  //   title: "状态",
  //   dataIndex: "status",
  //   key: "status",
  // },
];
onMounted(() => {
  fetchData();
});
const fetchData = async () => {
  tableLoading.value = true;
  const params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    beginDate: filters.value?.time?.[0] ?? null,
    endDate: filters.value?.time?.[1] ?? null,
    nickName: filters.value.nickName,
    consumptionType: filters.value.consumptionType,
  };
  const res = await getPointsConsumptionLogs(params);
  tableLoading.value = false;
  dataSource.value = res?.data || [];
  pagination.value.total = res?.total || 0;
};
</script>
<style scoped lang="less"></style>
