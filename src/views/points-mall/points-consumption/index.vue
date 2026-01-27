<template>
  <div class="consumption-page">
    <div class="filter-bar">
      <a-form :model="filters" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="用户ID/用户名">
              <a-input v-model:value="filters.keyword" placeholder="请输入用户ID或用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="消耗类型">
              <a-select v-model:value="filters.type">
                <a-select-option value="">全部类型</a-select-option>
                <a-select-option value="兑换">积分兑换</a-select-option>
                <a-select-option value="转赠">积分转赠</a-select-option>
                <a-select-option value="过期">积分过期</a-select-option>
              </a-select>
            </a-form-item></a-col
          >
          <a-col :span="6">
            <a-form-item label="时间范围">
              <a-range-picker v-model:value="filters.startDate" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>

          <a-col :span="6">
            <a-form-item>
              <div class="search-form-btns">
                <a-button type="primary" @click="doSearch">查询</a-button>
                <a-button @click="reset">重置</a-button>
                <a-button type="primary" @click="exportData">导出数据</a-button>
              </div>
            </a-form-item></a-col
          >

          <a-col :span="8"></a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-wrap">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" />
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";

const filters = ref({ keyword: "", type: "", startDate: "", endDate: "" });

const dataSource = ref([
  {
    id: "CONS20250101001",
    userId: "U1001",
    userName: "张三",
    type: "兑换",
    points: -500,
    before: 2500,
    after: 2000,
    link: "商品：无线鼠标",
    time: "2025-01-01 10:23:45",
    status: "已完成",
    statusCls: "green",
  },
  {
    id: "CONS20250101002",
    userId: "U1002",
    userName: "李四",
    type: "转赠",
    points: -200,
    before: 1800,
    after: 1600,
    link: "转赠给：王五",
    time: "2025-01-01 11:05:12",
    status: "已完成",
    statusCls: "green",
  },
  {
    id: "CONS20250101003",
    userId: "U1003",
    userName: "王五",
    type: "兑换",
    points: -1200,
    before: 3200,
    after: 2000,
    link: "商品：蓝牙耳机",
    time: "2025-01-01 12:15:30",
    status: "待发货",
    statusCls: "orange",
  },
  {
    id: "CONS20250101004",
    userId: "U1004",
    userName: "赵六",
    type: "过期",
    points: -200,
    before: 1200,
    after: 1000,
    link: "2024年12月积分过期",
    time: "2025-01-01 13:45:10",
    status: "已完成",
    statusCls: "green",
  },
  {
    id: "CONS20250101005",
    userId: "U1005",
    userName: "孙七",
    type: "转赠",
    points: -100,
    before: 800,
    after: 700,
    link: "转赠给：周八",
    time: "2025-01-01 14:20:55",
    status: "已完成",
    statusCls: "green",
  },
  {
    id: "CONS20250101006",
    userId: "U1006",
    userName: "周八",
    type: "兑换",
    points: -300,
    before: 1000,
    after: 700,
    link: "商品：USB风扇",
    time: "2025-01-01 15:30:20",
    status: "处理中",
    statusCls: "blue",
  },
]);

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: total => `共 ${total} 条记录`,
  showSizeChanger: true,
  onChange: (p, ps) => {
    page.value.current = p;
    pageSize.value = ps;
  },
});
const doSearch = () => {
  page.value.current = 1;
};
const reset = () => {
  page.value.current = 1;
};

const columns = [
  { title: "记录ID", dataIndex: "id", key: "id" },
  { title: "用户ID", dataIndex: "userId", key: "userId" },
  { title: "用户名", dataIndex: "userName", key: "userName" },
  { title: "消耗类型", dataIndex: "type", key: "type" },
  {
    title: "消耗积分",
    dataIndex: "points",
    key: "points",
  },
  { title: "消耗前余额", dataIndex: "before", key: "before" },
  { title: "消耗后余额", dataIndex: "after", key: "after" },
  {
    title: "关联信息",
    dataIndex: "link",
    key: "link",
  },
  { title: "消耗时间", dataIndex: "time", key: "time" },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
];
</script>
<style scoped lang="less">
.consumption-page {
  padding: 20px;
  font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.filter-bar {
  background: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-row label {
  color: #666;
}
.to {
  margin: 0 6px;
  color: #777;
}
.table-wrap {
  margin-top: 12px;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
}
.neg {
  color: #ff4d4f;
}
.link-info {
  color: #999;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}
.status-badge.green {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.status-badge.orange {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}
.status-badge.blue {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 18px;
}
</style>
