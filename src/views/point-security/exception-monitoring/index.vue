<template>
  <div class="realTimeMonitor">
    <div class="stats">
      <div class="stat-box">
        <div class="stat-title">今日交易总数</div>
        <div class="stat-value">1,250</div>
      </div>
      <div class="stat-box">
        <div class="stat-title">异常交易数</div>
        <div class="stat-value">5</div>
      </div>
      <div class="stat-box">
        <div class="stat-title">已处理异常</div>
        <div class="stat-value">3</div>
      </div>
      <div class="stat-box">
        <div class="stat-title">待处理异常</div>
        <div class="stat-value">2</div>
      </div>
    </div>
    <div class="table-operations">
      <a-space>
        <label> 用户昵称: </label>
        <a-input v-model:value="filterUsername" placeholder="输入用户昵称搜索" style="width: 200px" />
        <a-button type="primary" @click="fetchData"> 查询 </a-button>
        <a-button @click="resetFilters"> 重置 </a-button>
      </a-space>
    </div>
  </div>

  <a-table :columns="columns" :dataSource="data" :pagination="pagination" bordered :loading="loading">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <div class="table-action-tbns">
          <a-popconfirm
            title="确定要将该用户加入黑名单吗？"
            okText="是"
            cancelText="否"
            @confirm="handleIntervene(record)"
          >
            <a-button type="link">加入黑名单</a-button>
          </a-popconfirm>
          <a-popconfirm
            title="确定要将该用户标记为正常吗？"
            okText="是"
            cancelText="否"
            @confirm="handleMarkNormal(record)"
          >
            <a-button type="link">标记为正常</a-button>
          </a-popconfirm>
          <a-button @click="handleView(record)" type="link">查看</a-button>
        </div>
      </template>
      <template v-else-if="column.key === 'status'">
        <a-tag :color="getStatusColor(record.status)">
          {{ record.status }}
        </a-tag>
      </template>
    </template>
  </a-table>
  <!-- 查看异常详情 Modal -->
  <a-modal v-model:visible="viewModalVisible" title="异常详情" width="900px" :footer="null" destroyOnClose>
    <a-table
      :columns="detailColumns"
      :dataSource="detailData"
      size="small"
      :loading="detailLoading"
      :pagination="false"
      bordered
      rowKey="id"
    />
  </a-modal>
</template>

<script setup>
import { addToBlacklist, getSecurityAlertLogs, markAsNormal } from "@/api/monitor/index";
import { message } from "ant-design-vue";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "用户昵称",
    dataIndex: "nickName",
    key: "nickName",
  },

  {
    title: "异常类型",
    dataIndex: "restrictionType",
    key: "restrictionType",
  },

  {
    title: "异常次数",
    dataIndex: "exceptionCount",
    key: "exceptionCount",
  },
  {
    title: "操作",
    key: "operation",
  },
];

// 查看详情模态框相关
const viewModalVisible = ref(false);
const detailLoading = ref(false);
const detailColumns = [
  // { title: "用户名", dataIndex: "userName", key: "userName", width: 140 },
  { title: "异常原因", dataIndex: "reason", key: "reason" },
  {
    title: "积分类型",
    key: "pointType",
    width: 120,
    customRender: ({ record }) => {
      const sign = (record.change || "").toString().trim().charAt(0);
      return sign === "-" ? "商品兑换" : "积分奖励";
    },
  },
  {
    title: "积分变动",
    dataIndex: "change",
    key: "change",
    width: 110,
  },
  { title: "用户设备", dataIndex: "device", key: "device", width: 160 },
];

// Mock 数据（异常详情）
const mockDetailPool = [
  {
    id: 1,
    userName: "alice",
    reason: "短时间大量积分获取",
    // pointType: "获取", // 不再直接使用，动态由 change 推导
    change: "+500",
    device: "iPhone 14 / iOS 17",
    time: "2025-10-10 09:15:21",
  },
  {
    id: 2,
    userName: "bob",
    reason: "异常登录后积分提现",
    // pointType: "支出",
    change: "-300",
    device: "Windows 11 / Chrome",
    time: "2025-10-10 09:20:10",
  },
  {
    id: 3,
    userName: "charles",
    reason: "多账号切换刷积分",
    // pointType: "获取",
    change: "+120",
    device: "Android 14 / Huawei",
    time: "2025-10-10 09:33:45",
  },
  {
    id: 4,
    userName: "diana",
    reason: "脚本模拟任务",
    // pointType: "获取",
    change: "+260",
    device: "MacOS 15 / Safari",
    time: "2025-10-10 09:41:02",
  },
  {
    id: 5,
    userName: "eric",
    reason: "高频接口调用",
    // pointType: "获取",
    change: "+80",
    device: "Android 13 / Xiaomi",
    time: "2025-10-10 09:55:10",
  },
  {
    id: 6,
    userName: "frank",
    reason: "疑似撞库登录后支出",
    // pointType: "支出",
    change: "-150",
    device: "Windows 10 / Edge",
    time: "2025-10-10 10:02:33",
  },
  {
    id: 7,
    userName: "grace",
    reason: "批量注册同IP",
    // pointType: "获取",
    change: "+40",
    device: "iPadOS 18 / Safari",
    time: "2025-10-10 10:10:27",
  },
  {
    id: 8,
    userName: "henry",
    reason: "可疑任务回调",
    // pointType: "获取",
    change: "+300",
    device: "Linux / Firefox",
    time: "2025-10-10 10:18:19",
  },
];
const detailData = ref([]);

const openDetailModal = record => {
  viewModalVisible.value = true;
  detailLoading.value = true;
  // 模拟过滤：真实情况下根据 record.id 请求接口
  setTimeout(() => {
    // 简单模拟：取随机 5~8 条
    const count = Math.floor(Math.random() * 4) + 5;
    detailData.value = [...mockDetailPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((item, idx) => ({ ...item, id: `${record.id || "row"}-${idx}` }));
    detailLoading.value = false;
  }, 400);
};

/// 数据状态
const data = ref([]);

const loading = ref(false);
const filterUsername = ref("");
// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 5,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条`,

  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchData();
  },
});
const resetFilters = () => {
  filterUsername.value = "";
  pagination.value.current = 1;
  fetchData();
};
// 获取日志列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      nickName: filterUsername.value.trim(),
    };

    const response = await getSecurityAlertLogs(params);
    data.value = response?.data || [];
    pagination.value.total = response?.total ?? response?.data?.total ?? 0;
  } finally {
    loading.value = false;
  }
};
// 获取状态颜色
const getStatusColor = status => {
  const colors = {
    待处理: "orange",
    处理中: "blue",
    已处理: "green",
  };
  return colors[status] || "default";
};

const handleMarkNormal = async record => {
  await markAsNormal(record.id);
  message.success(`已标记为正常`);
};
const handleIntervene = async record => {
  await addToBlacklist(record.id);
  message.success(`已加入黑名单`);
};
const handleView = record => {
  openDetailModal(record);
};
//初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.realTimeMonitor {
  .stats {
    display: flex;
    gap: 20px;
    margin: 20px 0;

    .stat-box {
      flex: 1;
      background: #f0f3f7;
      padding: 16px;
      border-radius: 6px;
      text-align: center;

      .stat-title {
        color: #909399;
        font-size: 14px;
      }

      .stat-value {
        color: #2d3e50;
        font-size: 24px;
        font-weight: bold;
      }
    }
  }

  .table-operations {
    margin: 16px 0;
  }
}
</style>
