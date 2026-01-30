<template>
  <div class="consumption-page">
    <div class="filter-bar">
      <a-form :model="filters">
        <a-row :gutter="16">
          <a-col :span="4">
            <a-form-item label="用户名">
              <a-input v-model:value="filters.nickName" placeholder="请输入用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="学习类型">
              <DictSelect dictType="points_task_type" defaultOption="全部类型" v-model:value="filters.learningType" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="时间范围">
              <a-range-picker v-model:value="filters.time" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>

          <a-col :span="4">
            <a-form-item>
              <div class="search-form-btns">
                <a-button type="primary" @click="fetchData">查询</a-button>
                <a-button @click="reset">重置</a-button>
                <a-button type="primary" @click="exportData">导出报表</a-button>
              </div>
            </a-form-item></a-col
          >

          <a-col :span="8"></a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-wrap">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="tableLoading" />
    </div>
  </div>
</template>
<script setup>
import { getPointsLearningReport } from "@/api/goods/index";
import { useDictStore } from "@/store/dict.js";
import { onMounted, ref } from "vue";
const dicStore = useDictStore();

const learningTypeMap = dicStore.getDictMap("points_task_type");
const filters = ref({ nickName: "", learningType: null, time: null });

const dataSource = ref([]);

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: total => `共 ${total} 条记录`,
  showSizeChanger: true,
  onChange: (p, ps) => {
    pagination.value.current = p;
    pagination.value.pageSize = ps;
    fetchData();
  },
});

const reset = () => {
  pagination.value.current = 1;
  filters.value = { nickName: "", learningType: "", time: null };
  fetchData();
};

const columns = [
  // { title: "记录ID", dataIndex: "streamNo", key: "streamNo", ellipsis: true },
  { title: "用户昵称", dataIndex: "nickName", key: "nickName" },
  { title: "积分奖励类型", dataIndex: "taskName", key: "taskName", ellipsis: true },
  // {
  //   title: "学习内容",
  //   dataIndex: "points",
  //   key: "points",
  // },
  // { title: "学习时长", dataIndex: "before", key: "before" },
  {
    title: "获得积分",
    dataIndex: "points",
    key: "points",
  },
  { title: "获取前余额", dataIndex: "beforeBalance", key: "beforeBalance" },
  {
    title: "获取后余额",
    dataIndex: "afterBalance",
    key: "afterBalance",
  },
  {
    title: "获取时间",
    dataIndex: "createTime",
    key: "createTime",
  },
];
// 初始化加载数据
onMounted(() => {
  fetchData();
});
const tableLoading = ref(false);
const fetchData = async () => {
  tableLoading.value = true;
  const params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    beginDate: filters.value?.time?.[0] ?? null,
    endDate: filters.value?.time?.[1] ?? null,
    nickName: filters.value.nickName,
    learningType: filters.value.learningType,
  };
  const res = await getPointsLearningReport(params);
  dataSource.value = res?.data || [];
  pagination.value.total = res?.total || 0;
  tableLoading.value = false;
};
</script>
