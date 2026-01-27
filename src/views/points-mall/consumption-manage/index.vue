<template>
  <div class="points-account">
    <a-space>
      <label for="search">交易编号：</label>
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入交易编号搜索"
        @search="fetchData"
        @change="handleSearchChange"
      />
    </a-space>
    <a-table :columns="columns"
      :dataSource="data"
      :pagination="pagination"
      bordered
      class="table-operations"
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-space>
            <a @click="handleView(record)">查看</a>
          </a-space>
        </template>

        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'orange'">
            {{ record.status === 1 ? "成功" : "已退款" }}
          </a-tag>
        </template>
      </template>
    </a-table>
    <a-modal v-model:visible="modalVisible" title="详情" width="600px" :footer="null" :mask-closable="false">
      <a-form :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <!-- <a-form-item label="用户昵称" name="nickName">
          <a-input v-model:value="formState.nickName" placeholder="请输入用户昵称" disabled />
        </a-form-item> -->
        <a-form-item label="交易编号" name="streamNo">
          <a-input v-model:value="formState.streamNo" placeholder="请输入交易编号" disabled />
        </a-form-item>
        <a-form-item label="消耗类型" name="streamType">
          <a-select v-model:value="formState.streamType" placeholder="请选择消耗类型" disabled>
            <a-select-option :value="1">商品兑换</a-select-option>
            <a-select-option :value="2">服务兑换</a-select-option>
            <a-select-option :value="3">积分抽奖</a-select-option>
            <a-select-option :value="4">管理员调整</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="消耗积分" name="changeNum">
          <a-input-number
            v-model:value="formState.changeNum"
            placeholder="请输入消耗积分(负值)"
            style="width: 100%"
            disabled
          />
        </a-form-item>
        <a-form-item label="变动后余额" name="nowPoints">
          <a-input-number
            v-model:value="formState.nowPoints"
            placeholder="请输入变动后余额"
            style="width: 100%"
            :min="0"
            disabled
          />
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-select v-model:value="formState.status" placeholder="请选择状态" disabled>
            <a-select-option :value="1">成功</a-select-option>
            <a-select-option :value="2">已退款</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { getPointsConsumptionLogs } from "@/api/consumption/index";
import { debounce } from "lodash-es";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  // {
  //   title: "用户昵称",
  //   dataIndex: "nickName",
  //   key: "nickName",
  // },
  {
    title: "交易编号",
    dataIndex: "streamNo",
    key: "streamNo",
  },
  {
    title: "消耗类型",
    dataIndex: "streamType",
    key: "streamType",
  },
  {
    title: "消耗积分",
    dataIndex: "changeNum",
    key: "changeNum",
  },
  {
    title: "变动后余额",
    dataIndex: "nowPoints",
    key: "nowPoints",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
  },
];

const data = ref([]);
const loading = ref(false);

const modalVisible = ref(false);
const searchValue = ref("");

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;

    fetchData();
  },
});
const handleSearchChange = debounce(() => {
  fetchData();
}, 300);
// 表单数据
const formState = ref({
  nickName: null,
  streamNo: null,
  streamType: null,
  changeNum: null,
  nowPoints: null,
  status: null,
});

// 获取消耗类型名称
const getTypeName = type => {
  const types = {
    1: "商品兑换",
    2: "服务兑换",
    3: "积分抽奖",
    4: "管理员调整",
  };
  return types[type] || "未知";
};

// 获取消耗类型颜色
const getTypeColor = type => {
  const colors = {
    1: "blue",
    2: "green",
    3: "orange",
    4: "purple",
  };
  return colors[type] || "default";
};

// 获取积分消耗记录列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      streamNo: searchValue.value,
    };

    const response = await getPointsConsumptionLogs(params);
    data.value = response?.data;
    pagination.value.total = response.total || 0;
  } finally {
    loading.value = false;
  }
};
const handleView = record => {
  formState.value = { ...record };
  modalVisible.value = true;
};

/// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.points-account {
  .table-operations {
    margin: 16px 0;
  }

  .user-points-details {
    .user-info {
      margin-bottom: 16px;
      padding: 0 8px;

      h3 {
        margin: 0 0 8px 0;
        color: #1890ff;
      }
    }

    .points-summary {
      margin-top: 16px;
    }
  }
}
</style>
