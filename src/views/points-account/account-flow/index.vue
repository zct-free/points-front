<template>
  <div class="points-transaction">
    <a-form :model="searchForm" ref="searchFormRef">
      <a-row :gutter="16">
        <a-col :span="5">
          <a-form-item label="用户昵称" name="nickName">
            <a-input v-model:value="searchForm.nickName" placeholder="请输入用户昵称" />
          </a-form-item>
        </a-col>

        <a-col :span="10">
          <a-form-item label="日期范围" name="dateRange">
            <a-range-picker
              v-model:value="searchForm.dateRange"
              value-format="YYYY-MM-DD HH:mm:ss"
              show-time
              style="width: 100%;"
              format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-space>
            <a-button type="primary" @click="fetchData"> 查询 </a-button>
            <a-button @click="resetSearch"> 重置 </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-form>

    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <a-tab-pane key="income" tab="入账流水"></a-tab-pane>
      <a-tab-pane key="outcome" tab="出账流水"></a-tab-pane>
    </a-tabs>

    <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" row-key="id" :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="handleView(record)"> <EyeOutlined /> 查看 </a>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      :visible="viewVisible"
      :title="activeTab === 'income' ? '入账流水详情' : '出账流水详情'"
      @cancel="viewVisible = false"
      :width="500"
      :footer="null"
    >
      <div class="view-detail-container">
        <div class="detail-item">
          <span class="detail-label">账户昵称</span>
          <span class="detail-value">{{ viewData.nickName || "-" }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">积分变动：</span>
          <span class="detail-value">
            {{ viewData.changeNum || 0 }}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">当前余额：</span>
          <span class="detail-value">{{ viewData.nowPoints || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">流水类型：</span>
          <span class="detail-value">
            {{ getTransactionTypeText(viewData.streamType) }}
          </span>
        </div>

        <div class="detail-item">
          <span class="detail-label">获取时间：</span>
          <span class="detail-value">{{ viewData.createTime || "-" }}</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { jfzhJfczApi, jfzhJflsApi } from "@/api/jfzh/index";
import { EyeOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";

const ruleMap = {
  RULE: "任务奖励",
  PRODUCT: "商品兑换",
  EXPIRE: "过期",
  TRANSFER: "转赠",
};
// 状态管理
const loading = ref(false);
const viewVisible = ref(false);
const activeTab = ref("income");

// 查看数据
const viewData = ref({
  streamNo: null,
  changeNum: null,
  nowPoints: null,
  streamType: null,
  createdTime: null,
});

const searchForm = ref({
  nickName: null,
  streamType: null,
  status: null,
  dateRange: [],
});
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: (total, range) => `共 ${total} 条`,
  onChange: (pageNo, pageSize) => {
    pagination.value.current = pageNo;
    pagination.value.pageSize = pageSize;
    fetchData();
  },
});


// 表格列定义
const columns = ref([
  {
    title: "用户昵称",
    dataIndex: "nickName",
    key: "nickName",
  },

  {
    title: "积分变动",
    dataIndex: "changeNum",
    key: "changeNum",
    customRender: ({ text }) => {
      return activeTab.value === "income" ?  `+${text}` : `${text}`;
    },
  },
  {
    title: "当前余额",
    dataIndex: "nowPoints",
    key: "nowPoints",
  },
  {
    title: "流水类型",
    dataIndex: "streamType",
    key: "streamType",
    customRender: ({ text }) => {
      return ruleMap[text] || "";
    },
  },

  {
    title: "获取时间",
    dataIndex: "createTime",
    key: "createTime",
  },
  {
    title: "操作",
    key: "action",
  },
]);
const dataSource = ref([]);
onMounted(() => {
  fetchData();
});

// 数据获取方法
const fetchData = async () => {
  loading.value = true;
  const params = {
    ...searchForm.value,
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    beginTime: searchForm.value.dateRange?.[0] ?? null,
    endTime: searchForm.value.dateRange?.[1] ?? null,
  };
  Reflect.deleteProperty(params, "dateRange");

  try {
    if (activeTab.value === "income") {
      const res = await jfzhJflsApi(params);
      dataSource.value = res.data || [];
      pagination.value.total = res.total || 0;
    } else {
      const res = await jfzhJfczApi(params);
      dataSource.value = res.data || [];
      pagination.value.total = res.total || 0;
    }
  } finally {
    loading.value = false;
  }
};
const resetSearch = () => {
  searchForm.value = {
    nickName: null,
    streamType: null,
    status: null,
    dateRange: [],
  };
  pagination.value.current = 1;
  fetchData();
};
// 选项卡切换
const handleTabChange = key => {
  activeTab.value = key;
  fetchData();
};

// 查看模态框
const handleView = async record => {
  viewVisible.value = true;
  Object.assign(viewData.value, record);
};

// 获取交易类型文本
const getTransactionTypeText = type => {
  return ruleMap[type] || "";
};
</script>

<style scoped lang="less">
.search-bar {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.ant-table-cell .ant-btn {
  margin-right: 8px;
}

.ant-table-cell .ant-btn:last-child {
  margin-right: 0;
}

.view-detail-container {
  padding: 16px 0;
}

.detail-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.detail-label {
  width: 120px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #333;
  word-break: break-all;
}

.ant-tabs {
  margin-bottom: 16px;
}
</style>
