<template>
  <div class="points-account">
    <a-space>
      <label>规则名称：</label>
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入规则名称搜索"
        @search="fetchData"
        @change="handleSearchChange"
      />
      <a-button type="primary" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        新增
      </a-button>
      <a-button danger :disabled="!selectedRowKeys.length" @click="handleBatchDelete">
        <template #icon><delete-outlined /></template>
        批量删除
      </a-button>
    </a-space>

    <a-table
      :columns="columns"
      :dataSource="data"
      :pagination="pagination"
      bordered
      class="table-operations"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onSelect: onSelectedRowKeysChange,
        onSelectAll: onTableSelectAll,
      }"
      :loading="loading"
      rowKey="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-space>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确定要删除吗?" @confirm="handleDelete(record.id)">
              <a style="color: red">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'ruleType'">
          <span>{{ getRuleTypeText(record.ruleType) }}</span>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleModalOk"
      @cancel="resetForm"
      :cancel-text="'关闭'"
      :mask-closable="false"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <!-- <a-form-item label="规则编码" name="ruleCode">
          <a-input v-model:value="formState.ruleCode" placeholder="请输入规则唯一编码" :disabled="isEdit" />
        </a-form-item> -->
        <a-form-item label="规则名称" name="ruleName">
          <a-input v-model:value="formState.ruleName" placeholder="请输入规则名称" />
        </a-form-item>
        <a-form-item label="规则类型" name="ruleType">
          <a-select v-model:value="formState.ruleType" placeholder="请选择规则类型">
            <a-select-option :value="1">行为奖励</a-select-option>
            <a-select-option :value="2">任务奖励</a-select-option>
            <a-select-option :value="3">活动奖励</a-select-option>
            <a-select-option :value="4">手动调整</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-select v-model:value="formState.status" placeholder="请选择状态">
            <a-select-option :value="0">禁用</a-select-option>
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="2">测试中</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="奖励积分" name="rewardPoints">
          <a-input-number
            v-model:value="formState.rewardPoints"
            placeholder="请输入奖励积分"
            style="width: 100%"
            :min="0"
            :precision="0"
          />
        </a-form-item>
        <a-form-item label="每日最大次数" name="dayMaxNumber">
          <a-input-number
            v-model:value="formState.dayMaxNumber"
            placeholder="请输入每日最大次数"
            style="width: 100%"
            :min="0"
            :precision="0"
          />
        </a-form-item>
        <!-- <a-form-item label="有效期（天）" name="effectiveDay">
          <a-input-number
            v-model:value="formState.effectiveDay"
            placeholder="请输入积分有效期(天)"
            style="width: 100%"
            :min="0"
            :precision="0"
          />
        </a-form-item> -->

        <!-- <a-form-item label="规则描述" name="description">
          <a-textarea v-model:value="formState.description" placeholder="请输入规则描述" :rows="4" />
        </a-form-item> -->
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { addPointsRule, deletePointsRule, getPointsRules, updatePointsRule } from "@/api/rule/index";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import { debounce } from "lodash-es";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "规则编码",
    dataIndex: "ruleCode",
    key: "ruleCode",
  },
  {
    title: "规则名称",
    dataIndex: "ruleName",
    key: "ruleName",
  },
  // {
  //   title: "规则类型",
  //   dataIndex: "ruleType",
  //   key: "ruleType",
  // },
  {
    title: "每日最大次数",
    dataIndex: "dayMaxNumber",
    key: "dayMaxNumber",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
  // {
  //   title: "优先级",
  //   dataIndex: "priority",
  //   key: "priority",
  // },
  // {
  //   title: "有效期(天)",
  //   dataIndex: "effectiveDay",
  //   key: "effectiveDay",
  // },
  // {
  //   title: "累计计算",
  //   dataIndex: "isCumulative",
  //   key: "isCumulative",
  //   customRender: ({ text }) => (text ? "是" : "否"),
  // },
  {
    title: "创建人",
    dataIndex: "createUser",
    key: "createUser",
  },
  // {
  //   title: "创建时间",
  //   dataIndex: "createTime",
  //   key: "createTime",
  // },
  {
    title: "奖励积分",
    dataIndex: "rewardPoints",
    key: "rewardPoints",
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
const searchValue = ref("");
const selectedRowKeys = ref([]);
const tableSelectedRows = ref([]);
const modalVisible = ref(false);
const modalTitle = ref("新增积分规则");
const formRef = ref();
const isEdit = ref(false);
const currentId = ref("");
const dateRange = ref([]);

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `共 ${total} 条`,
  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchData();
  },
});

// 表单数据
const formState = ref({
  ruleCode: "",
  ruleName: "",
  ruleType: null,
  actionType: "",
  status: null,
  startTime: "",
  endTime: "",
  effectiveDay: null,
  rewardPoints: null,
  isCumulative: false,
  description: "",
  dayMaxNumber: null,
});

// 表单验证规则
const rules = {
  ruleCode: [{ required: true, message: "请输入规则编码", trigger: "blur" }],
  ruleName: [{ required: true, message: "请输入规则名称", trigger: "blur" }],
  ruleType: [{ required: true, message: "请选择规则类型", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  effectiveDay: [{ required: true, message: "请输入有效期", trigger: "blur" }],
};

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    0: "red",
    1: "green",
    2: "orange",
  };
  return colors[status] || "default";
};

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    0: "禁用",
    1: "启用",
    2: "测试中",
  };
  return texts[status] || "未知";
};

// 获取规则类型文本
const getRuleTypeText = (type) => {
  const texts = {
    1: "行为奖励",
    2: "任务奖励",
    3: "活动奖励",
    4: "手动调整",
  };
  return texts[type] || "未知";
};

// 获取积分规则列表
const fetchData = async () => {
  try {
    loading.value = true;

    // 构造请求参数
    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ruleName: searchValue.value,
    };

    const response = await getPointsRules(params);

    data.value = response.data || [];
    pagination.value.total = response.total || 0;
  } finally {
    loading.value = false;
  }
};
const handleSearchChange = debounce(() => {
  fetchData();
}, 500);
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
// 新增
const handleAdd = () => {
  modalTitle.value = "新增积分规则";
  isEdit.value = false;
  resetForm();
  modalVisible.value = true;
};

// 编辑
const handleEdit = record => {
  modalTitle.value = "编辑积分规则";
  isEdit.value = true;
  currentId.value = record.id;
  formState.value = { ...record };
  modalVisible.value = true;
};

// 删除
const handleDelete = async id => {
  try {
    await deletePointsRule(id);
    message.success("删除成功");
    fetchData();
  } catch (error) {
    message.error("删除失败");
  }
};

// 批量删除
const handleBatchDelete = async () => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除选中的${selectedRowKeys.value.length}条规则吗？`,
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      await deletePointsRule(selectedRowKeys.value.join(","));
      message.success(`删除成功`);
      selectedRowKeys.value = [];
      fetchData();
    },
  });
};

// 提交表单
const handleModalOk = async () => {
  try {
    await formRef.value?.validate();
    const params = { ...formState.value, startTime: dateRange?.value[0] || "", endTime: dateRange?.value[1] || "" };

    if (isEdit.value) {
      // 调用编辑接口
      await updatePointsRule({
        id: currentId.value,
        ...params,
      });
      message.success("更新成功");
    } else {
      // 调用新增接口
      await addPointsRule(params);
      message.success("新增成功");
    }

    modalVisible.value = false;
    resetForm();
    fetchData();
  } catch (error) {
    console.error("表单提交失败:", error);
    message.error(error.message || "表单提交失败");
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  formState.value = {
    ruleCode: "",
    ruleName: "",
    ruleType: null,
    actionType: "",
    status: null,
    startTime: "",
    endTime: "",
    effectiveDay: null,
    isCumulative: false,
    description: "",
  };
  dateRange.value = [];
  currentId.value = "";
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.points-account {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
