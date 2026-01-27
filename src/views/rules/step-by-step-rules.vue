<template>
  <div class="points-rule-tiered">
    <a-table
      :columns="columns"
      :dataSource="data"
      :pagination="pagination"
      bordered
      class="table-operations"

      rowKey="id"
      :loading="loading"
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
        <template v-else-if="column.key === 'conditionType'">
          <a-tag :color="getConditionTypeColor(record.conditionType)">
            {{ getConditionTypeText(record.conditionType) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'tierLevel'">
          <span style="color: #1890ff; font-weight: 500">{{ record.tierLevel }}</span>
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
      :mask-closable="false"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="奖励规则" name="description">
          <a-textarea v-model:value="formState.description" placeholder="请输入奖励规则描述" :rows="3" />
        </a-form-item>

        <a-form-item label="阶梯等级" name="tierLevel">
          <a-input-number v-model:value="formState.tierLevel" placeholder="请输入阶梯等级" style="width: 100%">
          </a-input-number>
        </a-form-item>

        <a-form-item label="条件类型" name="conditionType">
          <a-select v-model:value="formState.conditionType" placeholder="请选择条件类型">
            <a-select-option :value="1">次数</a-select-option>
            <a-select-option :value="2">数值</a-select-option>
            <a-select-option :value="3">时长</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="条件值" name="conditionValue">
          <a-input-number
            v-model:value="formState.conditionValue"
            placeholder="请输入条件值"
            style="width: 100%"
            :min="0"
            :step="0.01"
          />
        </a-form-item>
        <a-form-item label="奖励积分" name="rewardPoints">
          <a-input-number
            v-model:value="formState.rewardPoints"
            placeholder="请输入奖励积分"
            style="width: 100%"
            :min="0"
          />
        </a-form-item>
        <a-form-item label="奖励倍数" name="rewardMultiplier">
          <a-input-number
            v-model:value="formState.rewardMultiplier"
            placeholder="请输入奖励倍数"
            style="width: 100%"
            :min="0"
            :step="0.01"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {
  addPointsRuleTiered,
  deletePointsRuleTiered,
  getPointsRuleTiereds,
  updatePointsRuleTiered,
} from "@/api/rule/index";
import { message, Modal } from "ant-design-vue";
import { debounce } from "lodash-es";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "奖励规则",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "阶梯等级",
    dataIndex: "tierLevel",
    key: "tierLevel",
  },
  {
    title: "条件类型",
    dataIndex: "conditionType",
    key: "conditionType",
  },
  {
    title: "条件值",
    dataIndex: "conditionValue",
    key: "conditionValue",
  },
  {
    title: "奖励积分",
    dataIndex: "rewardPoints",
    key: "rewardPoints",
  },
  {
    title: "奖励倍数",
    dataIndex: "rewardMultiplier",
    key: "rewardMultiplier",
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

// 数据状态
const data = ref([]);
const loading = ref(false);
const searchValue = ref("");
const selectedRowKeys = ref([]);
const tableSelectedRows = ref([]);

const modalVisible = ref(false);
const modalTitle = ref("新增阶梯规则");
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
  tierLevel: null,
  conditionType: null,
  conditionValue: null,
  rewardPoints: null,
  rewardMultiplier: null,
  description: null,
});

// 表单验证规则
const rules = {
  ruleId: [{ required: true, message: "请输入关联规则ID", trigger: "blur" }],
  tierLevel: [{ required: true, message: "请输入阶梯等级", trigger: "change" }],
  conditionType: [{ required: true, message: "请选择条件类型", trigger: "change" }],
  conditionValue: [{ required: true, message: "请输入条件值", trigger: "blur" }],
  rewardPoints: [{ required: true, message: "请输入奖励积分", trigger: "blur" }],
};

// 获取条件类型颜色
const getConditionTypeColor = type => {
  const colors = {
    1: "blue",
    2: "green",
    3: "orange",
  };
  return colors[type] || "default";
};

// 获取条件类型文本
const getConditionTypeText = type => {
  const texts = {
    1: "次数",
    2: "数值",
    3: "时长",
  };
  return texts[type] || "未知";
};

// 获取阶梯规则列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current - 1,
      pageSize: pagination.value.pageSize,
      ruleId: searchValue.value,
    };

    const response = await getPointsRuleTiereds(params);

    data.value = response?.data || [];
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
  modalTitle.value = "新增阶梯规则";
  isEdit.value = false;
  resetForm();
  modalVisible.value = true;
};

// 编辑
const handleEdit = record => {
  modalTitle.value = "编辑阶梯规则";
  isEdit.value = true;
  currentId.value = record.id;
  formState.value = { ...record };
  modalVisible.value = true;
};

// 删除
const handleDelete = async id => {
  try {
    // 调用删除接口
    await deletePointsRuleTiered(id);
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
      await deletePointsRuleTiered(selectedRowKeys.value.join(","));
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

    if (isEdit.value) {
      await updatePointsRuleTiered({
        id: currentId.value,
        ...formState.value,
      });
      message.success("更新成功");
    } else {
      await addPointsRuleTiered(formState.value);
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
    tierLevel: null,
    conditionType: null,
    conditionValue: null,
    rewardPoints: null,
    rewardMultiplier: null,
    description: null,
  };
  currentId.value = "";
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.points-rule-tiered {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
