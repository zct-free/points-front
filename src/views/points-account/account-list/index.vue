<template>
  <div class="new-active">
    <div class="table-operations">
      <a-form :model="searchForm" ref="searchFormRef" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="账户状态" name="status">
              <a-select v-model:value="searchForm.status" placeholder="选择账户状态" allowClear>
                <a-select-option :value="1">正常</a-select-option>
                <a-select-option :value="2">冻结</a-select-option>
                <a-select-option :value="0">注销</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="用户等级" name="level">
              <a-select v-model:value="searchForm.level" placeholder="选择用户等级" allowClear>
                <a-select-option value="0">普通会员</a-select-option>
                <a-select-option value="1">白银会员</a-select-option>
                <a-select-option value="2">黄金会员</a-select-option>
                <a-select-option value="3">铂金会员</a-select-option>
                <a-select-option value="4">钻石会员</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="用户昵称" name="nickName">
              <a-input v-model:value="searchForm.nickName" placeholder="输入用户昵称搜索" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-space>
              <a-button type="primary" @click="fetchData"> 搜索 </a-button>
              <a-button @click="resetForm"> 重置 </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <a-table :columns="columns" :dataSource="data" :pagination="pagination" bordered :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-space>
            <!-- <a @click="handleView(record)">查看</a> -->
            <a @click="handleEdit(record)">编辑</a>
          </a-space>
        </template>
        <template v-else-if="column.key === 'accountStatus'">
          <a-tag :color="getStatusColor(record.accountStatus)">
            {{ getStatusText(record.accountStatus) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'level'">
          <a-tag :color="getLevelColor(record.level)">
            {{ getLevelText(record.level) }}
          </a-tag>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑模态框 -->
    <a-modal v-model:visible="modalVisible" title="编辑账户" width="600px" @ok="handleModalOk" @cancel="resetForm">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="用户昵称" name="nickName">
          <a-input v-model:value="formState.nickName" placeholder="请输入用户昵称" :disabled="isEdit" />
        </a-form-item>
        <a-form-item label="积分余额" name="points">
          <a-input-number
            v-model:value="formState.points"
            placeholder="请输入积分余额"
            style="width: 100%"
            :min="0"
            :disabled="isEdit"
          />
        </a-form-item>
        <a-form-item label="账户状态" name="status">
          <a-radio-group v-model:value="formState.status" :disabled="!isEdit">
            <a-radio :value="0">注销</a-radio>
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="2">冻结</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="用户等级" name="level">
          <a-select v-model:value="formState.level" placeholder="请选择用户等级" :disabled="isEdit">
            <a-select-option value="0">普通会员</a-select-option>
            <a-select-option value="1">白银会员</a-select-option>
            <a-select-option value="2">黄金会员</a-select-option>
            <a-select-option value="3">铂金会员</a-select-option>
            <a-select-option value="4">钻石会员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { getUserInfo, updateUserInfo } from "@/api/jifen/index";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { onMounted, ref } from "vue";

const searchForm = ref({
  status: null,
  level: null,
  nickName: null,
});
const searchFormRef = ref();
const statusMap = {
  0: "注销",
  1: "正常",
  2: "冻结",
};
const levelMap = {
  0: "普通会员",
  1: "白银会员",
  2: "黄金会员",
  3: "铂金会员",
  4: "钻石会员",
};

// 表格列配置
const columns = [
  {
    title: "用户昵称",
    dataIndex: "nickName",
    key: "nickName",
  },
  {
    title: "积分余额",
    dataIndex: "points",
    key: "pointsBalance",
  },
  {
    title: "累计获得积分",
    dataIndex: "totalPoints",
    key: "totalPoints",
  },
  {
    title: "累计使用积分",
    dataIndex: "availablePoints",
    key: "availablePoints",
  },
  {
    title: "账户状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return statusMap[text] || "未知状态";
    },
  },
  {
    title: "用户等级",
    dataIndex: "level",
    key: "level",
  },
  {
    title: "最后登录时间",
    dataIndex: "updateTime",
    key: "updateTime",
    customRender: ({ text }) => {
      return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
    },
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
  },
];

// 数据状态
const data = ref([]);
const loading = ref(false);
const selectedRowKeys = ref([]);
const tableSelectedRows = ref([]);
const modalVisible = ref(false);
const formRef = ref();
const isEdit = ref(false);

// 分页配置
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

// 表单数据
const formState = ref({
  nickName: null,
  points: null,
  status: null,
  level: null,
});

// 表单验证规则
const rules = {
  userName: [{ required: true, message: "请输入用户昵称", trigger: "blur" }],
  points: [{ required: true, message: "请输入积分余额", trigger: "blur" }],
  status: [{ required: true, message: "请选择账户状态", trigger: "change" }],
  level: [{ required: true, message: "请选择用户等级", trigger: "change" }],
};

// 获取用户等级颜色
const getLevelColor = level => {
  const colors = {
    普通会员: "blue",
    白银会员: "gray",
    黄金会员: "gold",
    铂金会员: "geekblue",
    钻石会员: "magenta",
  };
  return colors[level] || "default";
};
const getLevelText = level => {
  return levelMap[level] || "";
};
const fetchData = async () => {
  loading.value = true;
  const params = {
    ...searchForm.value,
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
  };

  try {
    const res = await getUserInfo(params);
    data.value = res.data || [];
    pagination.value.total = res.total || 0;
  } finally {
    loading.value = false;
  }
};
const onSelectedRowKeysChange = (record, selected) => {
  if (selected) {
    if (!selectedRowKeys.value.includes(record.id)) {
      selectedRowKeys.value = [...selectedRowKeys.value, record.id];
      tableSelectedRows.value = [...tableSelectedRows.value, record];
    }
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== record.id);
    tableSelectedRows.value = tableSelectedRows.value.filter(row => row.id !== record.id);
  }
};
const onTableSelectAll = (selected, _, changeRows) => {
  if (selected) {
    changeRows.forEach(item => {
      if (!selectedRowKeys.value.includes(item.id)) {
        selectedRowKeys.value.push(item.id);
        tableSelectedRows.value.push(item);
      }
    });
  } else {
    const currentPageKeys = data.value.map(item => item.id);
    selectedRowKeys.value = selectedRowKeys.value.filter(key => !currentPageKeys.includes(key));
    tableSelectedRows.value = tableSelectedRows.value.filter(row => !currentPageKeys.includes(row.id));
  }
};

// 编辑
const handleEdit = record => {
  isEdit.value = true;
  modalVisible.value = true;
  formState.value = { ...record };
};

// 提交表单
const handleModalOk = async () => {
  try {
    await formRef.value?.validate();
    await updateUserInfo({
      ...formState.value,
    });
    message.success("更新成功");
    modalVisible.value = false;
    resetForm();
    fetchData();
  } catch (error) {
    message.error(error.message || "表单提交失败");
  }
};

// 重置表单
const resetForm = () => {
  searchFormRef?.value?.resetFields();
  pagination.value.current = 1;
  fetchData();
};

// 获取状态对应的文本
const getStatusText = status => {
  const statusMap = {
    1: "正常",
    2: "冻结",
    3: "注销",
  };
  return statusMap[status] || "未知状态";
};

// 获取状态对应的颜色
const getStatusColor = status => {
  const colorMap = {
    1: "green",
    2: "orange",
    3: "red",
  };
  return colorMap[status] || "default";
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.new-active {
  .table-operations {
    margin-bottom: 16px;
  }
}
</style>
