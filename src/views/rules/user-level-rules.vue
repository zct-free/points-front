<template>
  <div class="user-level-page">
    <!-- Metrics Cards -->
    <div class="metrics-row">
      <div class="metric-card" v-for="m in metrics" :key="m.key">
        <div class="metric-left">
          <div class="metric-value">{{ m.value }}</div>
          <div class="metric-label">{{ m.label }}</div>
        </div>
        <div class="metric-icon" :class="m.iconClass">
          <span>{{ m.iconText }}</span>
        </div>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="actions-bar">
      <a-space>
        <a-select v-model:value="statusFilter" placeholder="全部状态" style="width: 120px">
          <a-select-option value="">全部状态</a-select-option>
          <a-select-option value="enabled">启用</a-select-option>
          <a-select-option value="disabled">禁用</a-select-option>
        </a-select>
        <a-input-search
          v-model:value="searchValue"
          placeholder="搜索等级名称或编码..."
          style="width: 220px"
          @search="fetchData"
        />
        <a-button type="primary" @click="handleAdd"
          ><template #icon><plus-outlined /></template>新增等级</a-button
        >
        <a-button danger :disabled="!selectedRowKeys.length" @click="handleBatchDelete">批量删除</a-button>
      </a-space>
    </div>

    <!-- Level Table -->
    <a-table
      :columns="columns"
      :dataSource="displayData"
      rowKey="id"
      bordered
      :pagination="pagination"
      :loading="loading"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onSelect: tableSelect,
        onSelectAll: tableSelectAll,
      }"
      class="level-table"
    >
      <template #bodyCell="{ column, record }">
        <!-- 图标列 -->
        <template v-if="column.key === 'icon'">
          <div class="level-icon" :class="'level-' + record.iconType">{{ record.iconText }}</div>
        </template>
        <!-- 权益列 -->
        <template v-else-if="column.key === 'privileges'">
          <a-space wrap>
            <a-tag v-for="p in record.privileges" :key="p" color="purple" class="privilege-tag">{{ p }}</a-tag>
          </a-space>
        </template>
        <!-- 状态列 -->
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === '0' ? 'green' : 'red'">{{ record.status === "0" ? "启用" : "禁用" }}</a-tag>
        </template>
        <!-- 操作列 -->
        <template v-else-if="column.key === 'operation'">
          <div class="table-action-tbns">
            <a-button type="link" @click="handleEdit(record)" size="small">编辑</a-button>
            <a-popconfirm @confirm="toggleStatus(record)">
              <template #title> 确定要{{ record.status === "0" ? "禁用" : "启用" }}吗? </template>
              <a-button type="link" size="small">{{ record.status === "0" ? "禁用" : "启用" }}</a-button>
            </a-popconfirm>
            <a-popconfirm title="确定删除该等级?" @confirm="handleDelete(record.id)">
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑 Modal -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="600px" @ok="handleModalOk" @cancel="resetForm">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="等级编码" name="code"><a-input v-model:value="formState.code" /></a-form-item>
        <a-form-item label="等级名称" name="name"><a-input v-model:value="formState.name" /></a-form-item>
        <a-form-item label="所需积分" name="requiredPoints" required>
          <a-input-number v-model:value="formState.requiredPoints" :min="0" style="width: 100%"
        /></a-form-item>

        <a-form-item label="等级图标" name="iconType" required>
          <a-select v-model:value="formState.iconType" placeholder="选择类型">
            <a-select-option value="bronze">青铜</a-select-option>
            <a-select-option value="silver">白银</a-select-option>
            <a-select-option value="gold">黄金</a-select-option>
            <a-select-option value="platinum">白金</a-select-option>
            <a-select-option value="diamond">钻石</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="等级权益" name="privileges">
          <div class="tags-box">
            <a-tag
              v-for="item in formState.privileges"
              :key="item"
              closable
              @close="delPrivilege(item)"
              color="#2db7f5"
              >{{ item }}</a-tag
            >
          </div>
          <a-input placeholder="输入权益后按回车添加" @pressEnter="addPrivilege" v-model:value="newPrivilege" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formState.status">
            <a-select-option value="0">启用</a-select-option>
            <a-select-option value="1">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序权重" name="sortWeight">
          <a-input-number v-model:value="formState.sortWeight" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="等级描述" name="description">
          <a-textarea v-model:value="formState.description" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { PlusOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { computed, ref } from "vue";

// Mock 数据

const levelData = ref([
  {
    id: "1",
    code: "LV001",
    name: "普通会员",
    iconText: "铜",
    iconType: "bronze",
    requiredPoints: 0,
    privileges: ["基础服务"],
    status: "0",
    createdAt: "2024-01-15 10:30:00",
    creator: "admin",
    sortWeight: 1,
    description: "普通会员描述信息",
  },
  {
    id: "2",
    code: "LV002",
    name: "青铜会员",
    iconText: "铜",
    iconType: "bronze",
    requiredPoints: 100,
    privileges: ["专属标识", "积分加成5%"],
    status: "0",
    createdAt: "2024-01-15 10:35:00",
    creator: "admin",
    sortWeight: 2,
    description: "青铜会员描述信息",
  },
  {
    id: "3",
    code: "LV003",
    name: "白银会员",
    iconText: "银",
    iconType: "silver",
    requiredPoints: 500,
    privileges: ["专属标识", "积分加成10%", "优先客服"],
    status: "0",
    createdAt: "2024-01-15 10:40:00",
    creator: "admin",
    sortWeight: 3,
    description: "白银会员描述信息",
  },
  {
    id: "4",
    code: "LV004",
    name: "黄金会员",
    iconText: "金",
    iconType: "gold",
    requiredPoints: 2000,
    privileges: ["专属标识", "积分加成15%", "优先客服", "专属活动"],
    status: "1",
    createdAt: "2024-01-15 10:45:00",
    creator: "admin",
    sortWeight: 4,
    description: "黄金会员描述信息",
  },
  {
    id: "5",
    code: "LV005",
    name: "白金会员",
    iconText: "白",
    iconType: "platinum",
    requiredPoints: 5000,
    privileges: ["专属标识", "积分加成20%", "免运费", "专属活动"],
    status: "0",
    createdAt: "2024-01-15 10:50:00",
    creator: "admin",
    sortWeight: 5,
    description: "白金会员描述信息",
  },
  {
    id: "6",
    code: "LV006",
    name: "钻石会员",
    iconText: "钻",
    iconType: "diamond",
    requiredPoints: 10000,
    privileges: ["专属标识", "积分加成30%", "优先客服", "专属活动", "免运费", "生日特权"],
    status: "0",
    createdAt: "2024-01-15 10:55:00",
    creator: "admin",
    sortWeight: 6,
    description: "钻石会员描述信息",
  },
]);

// Filters & state
const searchValue = ref("");
const statusFilter = ref("");
const loading = ref(false);
const selectedRowKeys = ref([]);

// Metrics
const metrics = computed(() => {
  const enabled = levelData.value.filter(l => l.status === "enabled").length;
  const highest = levelData.value[levelData.value.length - 1];
  return [
    { key: "total", label: "等级总数", value: levelData.value.length, iconText: "📊", iconClass: "ic-total" },
    { key: "enabled", label: "启用等级", value: enabled, iconText: "✅", iconClass: "ic-enabled" },
    { key: "users", label: "当前用户数", value: 1234, iconText: "👥", iconClass: "ic-users" },
    {
      key: "top",
      label: "最高等级",
      value: highest?.name || "-",
      iconText: "🏆",
      iconClass: "ic-top",
    },
  ];
});

// Table columns
const columns = [
  { title: "等级编码", dataIndex: "code", key: "code" },
  { title: "等级名称", dataIndex: "name", key: "name" },
  { title: "等级图标", dataIndex: "icon", key: "icon" },
  { title: "所需积分", dataIndex: "requiredPoints", key: "requiredPoints" },
  { title: "等级权益", dataIndex: "privileges", key: "privileges", ellipsis: true, width: "25%" },
  { title: "状态", dataIndex: "status", key: "status" },
  { title: "创建时间", dataIndex: "createdAt", key: "createdAt" },
  { title: "创建人", dataIndex: "creator", key: "creator" },
  { title: "操作", key: "operation", width: "20%" },
];

// Pagination
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: total => `共 ${total} 条`,
  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchData();
  },
});

// Display Data (filters applied)
const displayData = computed(() => {
  let list = levelData.value;
  if (searchValue.value.trim()) {
    const s = searchValue.value.trim().toLowerCase();
    list = list.filter(l => l.code.toLowerCase().includes(s) || l.name.toLowerCase().includes(s));
  }
  if (statusFilter.value) {
    list = list.filter(l => l.status === statusFilter.value);
  }
  pagination.value.total = list.length;
  return list;
});

// Modal form
const modalVisible = ref(false);
const modalTitle = ref("新增用户等级");
const formRef = ref();

const formState = ref({
  id: "",
  code: "",
  name: "",
  iconText: "",
  iconType: null,
  requiredPoints: 0,
  privileges: [],
  status: "0",
  sortWeight: 0,
  description: "",
});
const newPrivilege = ref("");
const rules = {
  code: [{ required: true, message: "请输入等级编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入等级名称", trigger: "blur" }],
  requiredPoints: [{ required: true, message: "请输入所需积分", trigger: "blur" }],
};

const handleAdd = () => {
  modalTitle.value = "新增等级";
  resetForm();
  modalVisible.value = true;
};
const addPrivilege = e => {
  if (!e.target.value?.length) return message.warning("权益不能为空");
  const value = e.target.value?.trim();
  if (formState.value.privileges.includes(value)) return message.warning("权益已存在");
  formState.value.privileges.push(value);
  newPrivilege.value = "";
};
const delPrivilege = item => {
  formState.value.privileges = formState.value.privileges.filter(p => p !== item);
};
const handleEdit = record => {
  modalTitle.value = "编辑等级";
  formState.value = {
    id: record.id,
    code: record.code,
    name: record.name,
    iconText: record.iconText,
    iconType: record.iconType,
    requiredPoints: record.requiredPoints,
    privileges: [...record.privileges],
    status: record.status,
    sortWeight: record.sortWeight,
    description: record.description,
  };
  modalVisible.value = true;
};
const toggleStatus = record => {
  record.status = record.status === "0" ? "1" : "0";
  message.success(`已${record.status === "1" ? "禁用" : "启用"}等级 ${record.name}`);
};
const handleDelete = id => {
  levelData.value = levelData.value.filter(l => l.id !== id);
  selectedRowKeys.value = selectedRowKeys.value.filter(k => k !== id);
  message.success("删除成功");
};
const handleBatchDelete = () => {
  if (!selectedRowKeys.value.length) return;
  levelData.value = levelData.value.filter(l => !selectedRowKeys.value.includes(l.id));
  selectedRowKeys.value = [];
  message.success("批量删除成功");
};
const handleModalOk = async () => {
  try {
    await formRef.value?.validate();
    if (formState.value.id) {
      const idx = levelData.value.findIndex(l => l.id === formState.value.id);
      if (idx > -1) levelData.value[idx] = { ...levelData.value[idx], ...formState.value };
      message.success("更新成功");
    } else {
      formState.value.id = Date.now().toString();
      levelData.value.push({
        ...formState.value,
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        creator: "admin",
      });
      message.success("新增成功");
    }
    modalVisible.value = false;
    resetForm();
  } catch (e) {
    message.error(e?.message || "提交失败");
  }
};
const resetForm = () => {
  formRef.value?.resetFields();
  formState.value = {
    id: "",
    code: "",
    name: "",
    iconText: "",
    iconType: null,
    requiredPoints: 0,
    privileges: [],
    status: "0",
    sortWeight: 0,
    description: "",
  };
};
const fetchData = () => {
  /* 预留真实接口调用 */
};
const tableSelect = (record, selected) => {
  const key = record.id;
  if (selected) {
    if (!selectedRowKeys.value.includes(key)) {
      selectedRowKeys.value.push(key);
    }
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter(k => k !== key);
  }
};
    const tableSelectAll = (selected, selectedRows, changeRows) => {
  const changeKeys = changeRows.map(r => r.id);
  if (selected) {
    selectedRowKeys.value.push(...changeKeys.filter(key => !selectedRowKeys.value.includes(key)));
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter(k => !changeKeys.includes(k));
  }
};
</script>

<style scoped lang="less">
.user-level-page {
}
.metrics-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.metric-card {
  flex: 1;
  min-width: 180px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  padding: 16px 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
.metric-left {
  display: flex;
  flex-direction: column;
}
.metric-value {
  font-size: 26px;
  font-weight: 600;
  color: #222;
  line-height: 1;
}
.metric-label {
  margin-top: 6px;
  font-size: 14px;
  color: #666;
}
.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}
.ic-total {
  background: #6950ff;
}
.ic-enabled {
  background: #00b578;
}
.ic-users {
  background: #ff6f2c;
}
.ic-top {
  background: #00c2e8;
}
.actions-bar {
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.level-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}
.level-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}
.level-bronze {
  background: linear-gradient(135deg, #c07d2b, #a86219);
}
.level-silver {
  background: linear-gradient(135deg, #bfc4c9, #909499);
}
.level-gold {
  background: linear-gradient(135deg, #f5d545, #d8a500);
  color: #333;
}
.level-platinum {
  background: linear-gradient(135deg, #eae9e5, #c8c6c3);
  color: #333;
}
.level-diamond {
  background: linear-gradient(135deg, #53d8ff, #02b3e9);
}
.privilege-tag {
  border-radius: 14px;
  font-size: 12px;
  line-height: 1;
  padding: 4px 10px;
}
.tags-box {
  display: flex;
  gap: 4px;
  margin-bottom: 5px;
}
</style>
