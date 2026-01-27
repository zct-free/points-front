<template>
  <div class="shipping-address">
    <a-space>
      <label for="search">收货人姓名：</label>
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入收货人姓名搜索"
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
      rowKey="id"
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-space>
            <a @click="handleView(record)">查看</a>

            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确定要删除吗?" @confirm="handleDelete(record.id)">
              <a style="color: red">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else-if="column.key === 'isDefault'">
          <a-tag :color="record.isDefault ? 'green' : 'default'">
            {{ record.isDefault ? "是" : "否" }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status ? 'green' : 'red'">
            {{ record.status ? "启用" : "禁用" }}
          </a-tag>
        </template>
      </template>
    </a-table>
    <!-- 新增/编辑模态框 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="600px" @ok="handleModalOk" @cancel="resetForm" :okButtonProps="{ disabled: isView }">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="用户ID" name="userId">
          <a-input v-model:value="formState.userId" placeholder="请输入用户唯一标识" :disabled="isEdit || isView" />
        </a-form-item>
        <a-form-item label="收货人姓名" name="receiverName">
          <a-input v-model:value="formState.receiverName" placeholder="请输入收货人姓名" :disabled="isView" />
        </a-form-item>
        <a-form-item label="收货人电话" name="receiverPhone">
          <a-input v-model:value="formState.receiverPhone" placeholder="请输入收货人电话" :disabled="isView" />
        </a-form-item>
        <a-form-item label="地区编码" name="regionCode">
          <a-input v-model:value="formState.regionCode" placeholder="请输入地区编码" :disabled="isView" />
        </a-form-item>
        <a-form-item label="地区名称" name="regionName">
          <a-input v-model:value="formState.regionName" placeholder="请输入地区名称" :disabled="isView" />
        </a-form-item>
        <a-form-item label="详细地址" name="detailAddress">
          <a-input v-model:value="formState.detailAddress" placeholder="请输入详细地址" :disabled="isView" />
        </a-form-item>
        <a-form-item label="邮政编码" name="postalCode">
          <a-input v-model:value="formState.postalCode" placeholder="请输入邮政编码" :disabled="isView" />
        </a-form-item>
        <a-form-item label="是否默认" name="isDefault">
          <a-switch v-model:checked="formState.isDefault" checked-children="是" un-checked-children="否" :disabled="isView" />
        </a-form-item>
        <a-form-item label="地址标签" name="tag">
          <a-select v-model:value="formState.tag" placeholder="请选择地址标签" :disabled="isView">
            <a-select-option value="家">家</a-select-option>
            <a-select-option value="公司">公司</a-select-option>
            <a-select-option value="学校">学校</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-switch v-model:checked="formState.status" checked-children="有效" un-checked-children="无效" :disabled="isView" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {
  addShippingAddress,
  deleteShippingAddress,
  getShippingAddresses,
  updateShippingAddress,
} from "@/api/address/index";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { debounce } from "lodash-es";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "收货人姓名",
    dataIndex: "receiverName",
    key: "receiverName",
  },
  {
    title: "收货人电话",
    dataIndex: "receiverPhone",
    key: "receiverPhone",
    customRender: ({ record }) => {
      return record.receiverPhone ? record.receiverPhone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2") : "";
    },
  },
  {
    title: "地区名称",
    dataIndex: "regionName",
    key: "regionName",
  },
  {
    title: "详细地址",
    dataIndex: "detailAddress",
    key: "detailAddress",
    customRender: ({ record }) => {
      return record.detailAddress
        ? record.detailAddress.length > 5
          ? record.detailAddress.substring(0, 5) + "****"
          : record.detailAddress
        : "";
    },
  },
  {
    title: "是否默认",
    dataIndex: "isDefault",
    key: "isDefault",
    customRender: ({ record }) => {
      return record.isDefault ? "是" : "否";
    },
  },
  {
    title: "地址标签",
    dataIndex: "tag",
    key: "tag",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    customRender: ({ record }) => {
      return record.status ? "有效" : "无效";
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
const searchValue = ref("");
const selectedRowKeys = ref([]);
const tableSelectedRows = ref([]);
const modalVisible = ref(false);
const modalTitle = ref("新增收货地址");
const formRef = ref();
const isEdit = ref(false);
const isView = ref(false);
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
  userId: "",
  receiverName: "",
  receiverPhone: "",
  regionCode: "",
  regionName: "",
  detailAddress: "",
  postalCode: "",
  isDefault: false,
  tag: "",
  status: true,
});

// 表单验证规则
const rules = {
  userId: [{ required: true, message: "请输入用户ID", trigger: "blur" }],
  receiverName: [{ required: true, message: "请输入收货人姓名", trigger: "blur" }],
  receiverPhone: [{ required: true, message: "请输入收货人电话", trigger: "blur" }],
  regionCode: [{ required: true, message: "请输入地区编码", trigger: "blur" }],
  regionName: [{ required: true, message: "请输入地区名称", trigger: "blur" }],
  detailAddress: [{ required: true, message: "请输入详细地址", trigger: "blur" }],
};

// 获取收货地址列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      receiverName: searchValue.value,
    };

    const response = await getShippingAddresses(params);
    const processedList = response?.data;
    data.value = processedList;
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
  modalTitle.value = "新增收货地址";
  isEdit.value = false;
  isView.value = false;
  modalVisible.value = true;
  resetForm();
};

// 编辑
const handleEdit = record => {
  modalTitle.value = "编辑收货地址";
  isEdit.value = true;
  isView.value = false;
  currentId.value = record.id;
  formState.value = { ...record };
  modalVisible.value = true;
};
// 查看
const handleView = record => {
  modalTitle.value = "查看收货地址";
  // set view-only mode
  isView.value = true;
  isEdit.value = false;
  currentId.value = record.id;
  formState.value = { ...record };
  modalVisible.value = true;
};
// 删除
const handleDelete = async id => {
  try {
    // 调用删除接口
    await deleteShippingAddress(id);
    message.success("删除成功");
    fetchData();
  } catch (error) {
    message.error("删除失败");
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    if (!selectedRowKeys.value.length) {
      message.warning("请选择要删除的地址");
      return;
    }
    await deleteShippingAddress(selectedRowKeys.value.join(","));
    message.success(`删除成功`);
    selectedRowKeys.value = [];
    tableSelectedRows.value = [];
    fetchData();
  } catch (error) {
    message.error("删除失败");
  }
};

// 提交表单
const handleModalOk = async () => {
  try {
    // If viewing, just close
    if (isView.value) {
      modalVisible.value = false;
      isView.value = false;
      resetForm();
      return;
    }
    await formRef.value?.validate();
    let params = {
      ...formState.value,
      isDefault: formState.value.isDefault ? 1 : 0, // true→1，false→0
      status: formState.value.status ? 1 : 0,
    };
    if (isEdit.value) {
      await updateShippingAddress({ ...params, id: currentId.value });
    } else {
      await addShippingAddress(params);
    }
    modalVisible.value = false;
    message.success(isEdit.value ? "更新成功" : "新增成功");
    resetForm();
    fetchData();
  } catch (error) {
    message.error(error?.message || "表单提交失败");
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  formState.value = {
    userId: "",
    receiverName: "",
    receiverPhone: "",
    regionCode: "",
    regionName: "",
    detailAddress: "",
    postalCode: "",
    isDefault: false,
    tag: "",
    status: true,
  };
  currentId.value = "";
  isView.value = false;
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.shipping-address {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
