<template>
  <div class="shipping-delivery">
    <a-space>
      <label for="search">订单编号：</label>
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入订单编号搜索"
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
        <template v-else-if="column.key === 'shippingStatus'">
          <a-tag :color="getStatusColor(record.shippingStatus)">
            {{ getStatusText(record.shippingStatus) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'deliveryNo'">
          <span style="font-weight: 500">{{ record.deliveryNo }}</span>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑模态框 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="600px" @ok="handleModalOk" @cancel="resetForm">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="物流单号" name="deliveryNo">
          <a-input v-model:value="formState.deliveryNo" placeholder="请输入物流单号" :disabled="isEdit" />
        </a-form-item>
        <a-form-item label="订单编号" name="orderNo">
          <a-input v-model:value="formState.orderNo" placeholder="请输入订单编号" />
        </a-form-item>
          <a-form-item label="收件人姓名" name="shippingUser">
          <a-input v-model:value="formState.shippingUser" placeholder="请输入收货地址" />
        </a-form-item>
        <a-form-item label="收货地址" name="address">
          <a-input v-model:value="formState.address" placeholder="请输入收货地址" />
        </a-form-item>
        <a-form-item label="物流公司" name="shippingCompany">
          <a-input v-model:value="formState.shippingCompany" placeholder="请输入物流公司" />
        </a-form-item>
        <a-form-item label="公司编码" name="shippingCode">
          <a-input v-model:value="formState.shippingCode" placeholder="请输入物流公司编码" />
        </a-form-item>
        <a-form-item label="签收电话" name="phone">
          <a-input v-model:value="formState.phone" placeholder="请输入签收电话" />
        </a-form-item>

        <a-form-item label="发货时间" name="shippingTime">
          <a-date-picker
            v-model:value="formState.shippingTime"
            style="width: 100%"
            show-time
            placeholder="选择发货时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <a-form-item label="签收时间" name="signTime">
          <a-date-picker
            v-model:value="formState.signTime"
            style="width: 100%"
            show-time
            placeholder="选择签收时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {
  addShippingDelivery,
  deleteShippingDelivery,
  getShippingDeliveries,
  updateShippingDelivery,
} from "@/api/delivery/index";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import Dayjs from "dayjs";
import { debounce } from "lodash-es";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "物流单号",
    dataIndex: "deliveryNo",
    key: "deliveryNo",
  },
  {
    title: "订单编号",
    dataIndex: "orderNo",
    key: "orderNo",
  },
  {
    title: "物流公司",
    dataIndex: "shippingCompany",
    key: "shippingCompany",
  },
  {
    title: "公司编码",
    dataIndex: "shippingCode",
    key: "shippingCode",
  },
  {
    title: "收货人姓名",
    dataIndex: "shippingUser",
    key: "shippingUser",
  },
  {
    title: "电话",
    dataIndex: "phone",
    key: "phone",
    customRender: ({ record }) => {
      return record.phone ? record.phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2") : "";
    },
  },
  {
    title: "地址",
    dataIndex: "address",
    key: "address",
    customRender: ({ record }) => {
      return record.address
        ? record.address.length > 5
          ? record.address.substring(0, 5) + "****"
          : record.address
        : "";
    },
  },

  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
    customRender: ({ record }) => {
      return record.createTime ? Dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss") : "";
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
const modalTitle = ref("新增物流信息");
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
  deliveryNo: "",
  orderNo: "",
  shippingCompany: "",
  shippingCode: "",
  shippingUser: "",
  phone: "",
  address: "",
  shippingTime: null,
  signTime: null,
});

// 表单验证规则
const rules = {
  deliveryNo: [{ required: true, message: "请输入物流单号", trigger: "blur" }],
  orderNo: [{ required: true, message: "请输入订单编号", trigger: "blur" }],
  shippingUser: [{ required: true, message: "请输入收件人姓名", trigger: "blur" }],
  address: [{ required: true, message: "请输入收货地址", trigger: "blur" }],
  shippingCompany: [{ required: true, message: "请输入物流公司", trigger: "blur" }],
  shippingCode: [{ required: true, message: "请输入物流公司编码", trigger: "blur" }],
  shippingStatus: [{ required: true, message: "请选择物流状态", trigger: "change" }],
  phone: [
    { required: false, message: "请输入签收电话" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入有效的手机号",
    },
  ],
};

// 获取状态颜色
const getStatusColor = status => {
  const colors = {
    1: "blue",
    2: "cyan",
    3: "orange",
    4: "purple",
    5: "green",
  };
  return colors[status] || "default";
};

// 获取状态文本
const getStatusText = status => {
  const texts = {
    1: "待发货",
    2: "已揽件",
    3: "运输中",
    4: "派送中",
    5: "已签收",
  };
  return texts[status] || "未知";
};

// 获取物流信息列表
const fetchData = async () => {
  try {
    loading.value = true;

    // 构造请求参数
    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      orderNo: searchValue.value,
    };

    // 调用后端API
    const response = await getShippingDeliveries(params);
    const processedList = response?.data;
    data.value = processedList;
    pagination.value.total = response.total || 0;
  } catch (error) {
    console.error("获取数据失败:", error);
    message.error("获取数据失败");
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
  modalTitle.value = "新增快递信息";
  isEdit.value = false;
  modalVisible.value = true;
  resetForm();
};

// 编辑
const handleEdit = record => {
  modalTitle.value = "编辑快递信息";
  isEdit.value = true;
  currentId.value = record.id;
  modalVisible.value = true;
  formState.value = { ...record };
};

// 删除
const handleDelete = async id => {
  try {
    // 调用删除接口
    await deleteShippingDelivery(id);
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
      message.warning("请选择要删除的记录");
      return;
    }

    // 调用批量删除接口
    await deleteShippingDelivery(selectedRowKeys.value.join(","));
    message.success(`删除成功`);
    selectedRowKeys.value = [];
    fetchData();
  } catch (error) {
    message.error("批量删除失败");
  }
};

// 提交表单
const handleModalOk = async () => {
  try {
    await formRef.value?.validate();

    if (isEdit.value) {
      // 调用编辑接口
      await updateShippingDelivery({
        id: currentId.value,
        ...formState.value,
      });
      message.success("更新成功");
    } else {
      // 调用新增接口
      await addShippingDelivery({
        ...formState.value,
      });
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
    deliveryNo: "",
    orderNo: "",
    shippingCompany: "",
    shippingCode: "",
    shippingUser: "",
    phone: "",
    address: "",
    shippingTime: null,
    signTime: null,
  };
  currentId.value = "";
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.shipping-delivery {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
