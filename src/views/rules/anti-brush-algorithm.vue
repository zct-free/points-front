<template>
  <div class="points-anti-cheat">
    <a-form layout="inline" :model="searchForm">
      <a-form-item label="作弊类型" name="cheatType">
        <a-input v-model:value="searchForm.cheatType" placeholder="请输入作弊类型"></a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="fetchData">查询</a-button>
        <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table
      :columns="columns"
      :dataSource="data"
      :pagination="pagination"
      bordered
      class="table-operations"
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
      </template>
    </a-table>
    <!-- 新增/编辑模态框 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="600px" @ok="handleModalOk" @cancel="resetForm">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="作弊类型" name="cheatType">
          <a-input v-model:value="formState.cheatType" placeholder="请输入作弊类型"> </a-input>
        </a-form-item>
        <a-form-item label="策略" name="strategy">
          <a-input v-model:value="formState.strategy" placeholder="请输入策略"> </a-input>
        </a-form-item>
        <a-form-item label="阈值" name="thresholdValue">
          <a-input-number
            v-model:value="formState.thresholdValue"
            placeholder="请输入阈值"
            style="width: 100%"
            :min="1"
          />
        </a-form-item>
        <a-form-item label="时间窗口(分钟)" name="timeWindow">
          <a-input-number
            v-model:value="formState.timeWindow"
            placeholder="请输入时间窗口(分钟)"
            style="width: 100%"
            :min="1"
          />
        </a-form-item>
        <a-form-item label="惩罚积分（分钟）" name="penaltyPoints">
          <a-input-number
            v-model:value="formState.penaltyPoints"
            placeholder="请输入惩罚扣除积分"
            style="width: 100%"
            :min="0"
          />
        </a-form-item>
        <a-form-item label="惩罚时长(分)" name="penaltyDuration">
          <a-input-number
            v-model:value="formState.penaltyDuration"
            placeholder="请输入惩罚持续时间(分钟)"
            style="width: 100%"
            :min="0"
          />
        </a-form-item>
        <a-form-item label="是否启用" name="activeMark">
          <a-switch v-model:checked="formState.activeMark" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {
  addPointsRuleAntiCheat,
  deletePointsRuleAntiCheat,
  getPointsRuleAntiCheats,
  updatePointsRuleAntiCheat,
} from "@/api/rule/index";
import { message, Modal } from "ant-design-vue";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "作弊类型",
    dataIndex: "cheatType",
    key: "cheatType",
  },
  {
    title: "策略",
    dataIndex: "strategy",
    key: "strategy",
  },
  {
    title: "阈值",
    dataIndex: "thresholdValue",
    key: "thresholdValue",
  },
  {
    title: "时间窗口(分钟)",
    dataIndex: "timeWindow",
    key: "timeWindow",
  },
  {
    title: "惩罚积分",
    dataIndex: "penaltyPoints",
    key: "penaltyPoints",
  },
  {
    title: "惩罚时长(分钟)",
    dataIndex: "penaltyDuration",
    key: "penaltyDuration",
  },
  {
    title: "是否启用",
    dataIndex: "activeMark",
    key: "activeMark",
    customRender: ({ text }) => {
      return text ? "否" : "是";
    },
  },
  // {
  //   title: "创建时间",
  //   dataIndex: "createdTime",
  //   key: "createdTime",
  // },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
  },
];
const searchForm = ref({
  cheatType: null,
});

// 数据状态
const data = ref([]);
const loading = ref(false);
const searchValue = ref("");
const selectedRowKeys = ref([]);
const tableSelectedRows = ref([]);

const modalVisible = ref(false);
const modalTitle = ref("新增反刷规则");
const formRef = ref();
const isEdit = ref(false);
const currentId = ref("");

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
  cheatType: null,
  strategy: null,
  thresholdValue: null,
  timeWindow: null,
  penaltyPoints: 0,
  penaltyDuration: null,
  activeMark: true,
});

// 表单验证规则
const rules = {
  ruleId: [{ required: true, message: "请输入规则ID", trigger: "blur" }],
  cheatType: [{ required: true, message: "请选择作弊类型", trigger: "change" }],
  strategy: [{ required: true, message: "请选择策略", trigger: "change" }],
  thresholdValue: [{ required: true, message: "请输入阈值", trigger: "blur" }],
  timeWindow: [{ required: true, message: "请选择时间窗口", trigger: "change" }],
};

// 获取反刷规则列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      cheatType: searchForm.value.cheatType?.trim(),
    };

    const response = await getPointsRuleAntiCheats(params);
    data.value = response?.data;
    pagination.value.total = response.total || 0;
  } finally {
    loading.value = false;
  }
};
const handleReset = () => {
  searchForm.value.cheatType = null;
  pagination.value.current = 1;
  fetchData();
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
// 新增
const handleAdd = () => {
  modalTitle.value = "新增反刷规则";
  isEdit.value = false;
  resetForm();
  modalVisible.value = true;
};

// 编辑
const handleEdit = record => {
  modalTitle.value = "编辑反刷规则";
  isEdit.value = true;
  currentId.value = record.id;
  // 填充表单数据
  formState.value = { ...record, activeMark: !record.activeMark };
  modalVisible.value = true;
};

// 删除
const handleDelete = async id => {
  try {
    // 调用删除接口
    await deletePointsRuleAntiCheat(id);
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
      await deletePointsRuleAntiCheat(selectedRowKeys.value.join(","));
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

    const submitData = {
      ...formState.value,
      activeMark: formState.value.activeMark ? 0 : 1,
    };
    if (isEdit.value) {
      submitData.id = currentId.value;
      await updatePointsRuleAntiCheat(submitData);
      message.success("更新成功");
    } else {
      await addPointsRuleAntiCheat(submitData);
      message.success("新增成功");
    }

    modalVisible.value = false;
    resetForm();
    fetchData();
  } catch (error) {
    message.error(error.message || "表单提交失败");
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();

  formState.value = {
    ruleId: null,
    cheatType: null,
    strategy: null,
    thresholdValue: null,
    timeWindow: null,
    penaltyPoints: 0,
    penaltyDuration: null,
    activeMark: true,
  };
  currentId.value = "";
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.points-anti-cheat {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
