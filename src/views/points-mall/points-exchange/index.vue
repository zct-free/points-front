<template>
  <div class="points-exchange">
    <a-space>
      <label for=""> 订单号：</label>
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入订单号搜索"
        @search="fetchData"
        @change="handleSearchChange"
      />
      <a-button type="primary" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        新增
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
            <a-button type="link" @click="handleView(record)">查看</a-button>
            <a-button type="link" @click="handleAddAddress(record)">查看地址</a-button>
          </a-space>
        </template>
        <template v-else-if="column.key === 'orderStatus'">
          <a-tag :color="getStatusColor(record.orderStatus)">
            {{ getStatusText(record.orderStatus) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'totalPoints'">
          <span style="color: #1890ff; font-weight: 500">{{ record.totalPoints }}</span>
        </template>
      </template>
    </a-table>
    <!-- 新增/编辑模态框 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="600px" @ok="handleModalOk" @cancel="resetForm">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="订单编号" name="streamNo">
          <a-input v-model:value="formState.streamNo" placeholder="请输入订单编号" :disabled="isEdit || isView" />
        </a-form-item>
        <a-form-item label="收货人姓名" name="nickName">
          <a-input v-model:value="formState.nickName" placeholder="请输入收货人姓名" :disabled="isEdit || isView" />
        </a-form-item>
        <a-form-item label="商品名称" name="productName">
          <a-input v-model:value="formState.productName" placeholder="请输入商品名称" :disabled="isEdit || isView" />
        </a-form-item>

        <a-form-item label="订单状态" name="orderStatus">
          <a-select v-model:value="formState.orderStatus" placeholder="请选择订单状态" :disabled="isView">
            <a-select-option value="1">待处理</a-select-option>
            <a-select-option value="2">已确认</a-select-option>
            <a-select-option value="3">已发货</a-select-option>
            <a-select-option value="4">已完成</a-select-option>
            <a-select-option value="5">已取消</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="消耗积分" name="pointsConsume">
          <a-input-number
            v-model:value="formState.pointsConsume"
            placeholder="请输入消耗积分"
            style="width: 100%"
            :min="0"
            :disabled="isView"
          />
        </a-form-item>
        <a-form-item label="商品数量" name="productNumber">
          <a-input-number
            v-model:value="formState.productNumber"
            placeholder="请输入商品数量"
            style="width: 100%"
            :min="0"
            :disabled="isView"
          />
        </a-form-item>
        <a-form-item label="用户备注" name="userRemark">
          <a-textarea v-model:value="formState.userRemark" placeholder="请输入用户备注" :disabled="isView" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      title="查看收货地址"
      v-model:visible="addressModalVisible"
      @ok="handleAddressModalOk"
      @cancel="handleAddressModalCancel"
      width="1000px"
    >
      <a-table :columns="addressColumns" :dataSource="addressData" ></a-table>
      <template #footer> <a-button @click="addressModalVisible = false">关闭</a-button> </template>
    </a-modal>
  </div>
</template>

<script setup>
import { getShippingAddresses } from "@/api/address/index";
import { addPointsExchangeOrder, getPointsExchangeOrders, updatePointsExchangeOrder } from "@/api/exchange/index";
import { PlusOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { debounce } from "lodash-es";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "订单编号",
    dataIndex: "streamNo",
    key: "streamNo",
  },
  // {
  //   title: "用户昵称",
  //   dataIndex: "nickName",
  //   key: "nickName",
  // },
  {
    title: "订单状态",
    dataIndex: "orderStatus",
    key: "orderStatus",
  },
  {
    title: "消耗积分",
    dataIndex: "pointsConsume",
    key: "pointsConsume",
  },
  {
    title: "商品数量",
    dataIndex: "productNumber",
    key: "productNumber",
  },
  {
    title: "用户备注",
    dataIndex: "userRemark",
    key: "userRemark",
  },
  {
    title: "交易时间",
    dataIndex: "createTime",
    key: "createTime",
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
  },
];
const addressColumns = [
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
];
const addressModalVisible = ref(false);
const addressData = ref([]);
// 数据状态
const data = ref([]);
const loading = ref(false);
const searchValue = ref("");
const selectedRowKeys = ref([]);
const tableSelectedRows = ref([]);

const modalVisible = ref(false);
const modalTitle = ref("新增积分兑换订单");
const formRef = ref();
const currentId = ref(null);
const isEdit = ref(false);

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
const isView = ref(false);

// 表单数据
const formState = ref({
  streamNo: null,
  nickName: null,
  orderStatus: null,
  pointsConsume: null,
  productNumber: null,
  userRemark: null,
  productName: null,
});

// 表单验证规则
const rules = {
  streamNo: [{ required: true, message: "请输入订单编号", trigger: "blur" }],
  userId: [{ required: true, message: "请输入用户ID", trigger: "blur" }],
  orderStatus: [{ required: true, message: "请选择订单状态", trigger: "change" }],
  pointsConsume: [{ required: true, message: "请输入消耗积分", trigger: "blur" }],
  productNumber: [{ required: true, message: "请输入商品数量", trigger: "blur" }],
};

// 获取订单状态颜色
const getStatusColor = status => {
  const colors = {
    1: "blue",
    2: "green",
    3: "orange",
    4: "purple",
    5: "red",
  };
  return colors[status] || "default";
};

// 获取订单状态文本
const getStatusText = status => {
  const texts = {
    1: "待处理",
    2: "已确认",
    3: "已发货",
    4: "已完成",
    5: "已取消",
  };
  return texts[status] || "未知状态";
};

// 获取积分兑换订单列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      streamNo: searchValue.value,
    };

    const response = await getPointsExchangeOrders(params);
    data.value = response?.data || response || [];
    pagination.value.total = response?.total ?? response?.data?.total ?? pagination.value.total;
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

// 查看收货地址
const handleView = record => {
  formState.value = { ...record };
  isView.value = true;
  isEdit.value = false;
  modalVisible.value = true;
};
const handleAddAddress = async record => {
  addressModalVisible.value = true;
  try {
    const response = await getShippingAddresses({ userId: record.userId });
    addressData.value = response?.data || response || [];
  } finally {
  }
};
const handleAddressModalOk = () => {
  if (tableSelectedRows.value.length === 0) {
    message.warning("请至少选择一个收货地址");
    return;
  }
  message.success("收货地址添加成功");
  handleAddressModalCancel();
};
const handleAddressModalCancel = () => {
  addressModalVisible.value = false;
  selectedRowKeys.value = [];
  tableSelectedRows.value = [];
};
// 新增
const handleAdd = () => {
  modalTitle.value = "新增积分兑换订单";
  isEdit.value = false;
  isView.value = false;
  resetForm();
  modalVisible.value = true;
};

// 提交表单
const handleModalOk = async () => {
  try {
    await formRef.value?.validate();

    if (isEdit.value) {
      await updatePointsExchangeOrder({
        id: currentId.value,
        ...formState.value,
      });
      message.success("更新成功");
    } else {
      await addPointsExchangeOrder(formState.value);
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
    streamNo: null,
    userId: null,
    orderStatus: null,
    pointsConsume: null,
    productNumber: null,
    userRemark: null,
  };
  currentId.value = null;
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.points-exchange {
  .table-operations {
    margin: 16px 0;
  }

  .address-details {
    padding: 10px 0;

    :deep(.ant-descriptions-item-label) {
      font-weight: 500;
      width: 100px;
    }
  }
}
</style>
