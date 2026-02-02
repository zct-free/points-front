<template>
  <div class="points-product">
    <a-space>
      <label>商品名称：</label>
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入商品名称搜索"
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
          <div class="table-action-tbns">
            <a @click="handleView(record)">查看</a>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确定要删除吗?" @confirm="handleDelete(record.id)">
              <a style="color: red">删除</a>
            </a-popconfirm>
            <a-popconfirm title="确定要下架该商品吗?" @confirm="handleDown(record)">
              <a>下架</a>
            </a-popconfirm>
            <a-popconfirm title="确定要上架该商品吗?" @confirm="handleUp(record)">
              <a>上架</a>
            </a-popconfirm>
          </div>
        </template>
        <template v-if="column.key === 'productType'">
          <a-tag :color="getProductTypeColor(record.productType)">
            {{ getProductTypeText(record.productType) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'pointsCost'">
          <span style="color: #ff4d4f; font-weight: 500">{{ record.pointsCost }}</span>
        </template>
        <template v-if="column.key === 'cashPrice'">
          <span style="color: #52c41a; font-weight: 500">¥{{ record.cashPrice }}</span>
        </template>
        <template v-if="column.key === 'imageUrl'">
          <a-avatar :src="record.imageUrl" />
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
      :okButtonProps="{ disabled: isView }"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <!-- <a-form-item label="商品编码" name="productCode">
          <a-input v-model:value="formState.productCode" placeholder="请输入商品编码" :disabled="isView" />
        </a-form-item> -->
        <a-form-item label="商品名称" name="productName">
          <a-input v-model:value="formState.productName" placeholder="请输入商品名称" :disabled="isView" />
        </a-form-item>
        <a-form-item label="商品类型" name="productType">
          <a-select v-model:value="formState.productType" placeholder="请选择商品类型" :disabled="isView">
            <a-select-option :value="1">实物商品</a-select-option>
            <a-select-option :value="2">虚拟商品</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所需积分" name="pointsCost">
          <a-input-number
            v-model:value="formState.pointsCost"
            placeholder="请输入兑换所需积分"
            style="width: 100%"
            :min="0"
            :disabled="isView"
          />
        </a-form-item>
        <a-form-item label="现金价值" name="cashPrice">
          <a-input-number
            v-model:value="formState.cashPrice"
            placeholder="请输入现金价值"
            style="width: 100%"
            :min="0"
            :step="0.01"
            :precision="2"
            :disabled="isView"
          />
        </a-form-item>
        <!-- <a-form-item label="总库存" name="inventoryTotal">
          <a-input-number
            v-model:value="formState.inventoryTotal"
            placeholder="请输入总库存"
            style="width: 100%"
            :min="0"
            :precision="0"
            :disabled="isView"
          />
        </a-form-item> -->
        <!-- <a-form-item label="可用库存" name="inventoryAvailable">
          <a-input-number
            v-model:value="formState.inventoryAvailable"
            placeholder="请输入可用库存"
            style="width: 100%"
            :min="0"
            :precision="0"
            :disabled="isView"
          />
        </a-form-item> -->
        <!-- <a-form-item label="限购数量" name="limitPerUser">
          <a-input-number
            v-model:value="formState.limitPerUser"
            placeholder="请输入每人限购数量"
            style="width: 100%"
            :min="1"
            :precision="0"
            :disabled="isView"
          />
        </a-form-item>
        <a-form-item label="有效期" name="validDays">
          <a-input-number
            v-model:value="formState.validDays"
            placeholder="请输入兑换后有效期(天)"
            style="width: 100%"
            :min="1"
            :precision="0"
            :disabled="isView"
          />
        </a-form-item> -->
        <a-form-item label="主图URL" name="imageUrl">
          <a-input v-model:value="formState.imageUrl" placeholder="请输入主图URL" :disabled="isView" v-if="!isView" />
          <a-image :src="formState.imageUrl" v-else="isView" :width="50" />
        </a-form-item>
        <a-form-item label="商品状态" name="status">
          <a-select v-model:value="formState.status" placeholder="请选择商品状态" :disabled="isView">
            <a-select-option :value="0">下架</a-select-option>
            <a-select-option :value="1">上架</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="商品描述" name="productDesc">
          <a-textarea v-model:value="formState.productDesc" placeholder="请输入商品详情" :rows="4" :disabled="isView" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {
  addPointsProduct,
  deletePointsProduct,
  getPointsProducts,
  updatePointsProduct,
  updatePointsProductStatus,
} from "@/api/goods/index";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { debounce } from "lodash-es";
import { nextTick, onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "商品编码",
    width: "15%",
    dataIndex: "productCode",
    key: "productCode",
  },
  {
    title: "商品名称",
    dataIndex: "productName",
    key: "productName",
    width: "15%",
    ellipsis: true,
  },

  {
    title: "商品类型",
    dataIndex: "productType",
    key: "productType",
  },
  {
    title: "商品图片",
    dataIndex: "imageUrl",
    key: "imageUrl",
  },
  {
    title: "所需积分",
    dataIndex: "pointsCost",
    key: "pointsCost",
  },
  {
    title: "现金价值",
    dataIndex: "cashPrice",
    key: "cashPrice",
  },

  {
    title: "商品状态",
    dataIndex: "status",
    key: "status",
  },
  // {
  //   title: "创建时间",
  //   dataIndex: "createdTime",
  //   key: "createdTime",
  // },
  {
    title: "操作",
    key: "operation",
  },
];

// 数据状态
const data = ref([]);
const loading = ref(false);
const searchValue = ref("");
const selectedRowKeys = ref([]);
const tableSelectedRows = ref([]);
const modalVisible = ref(false);
const modalTitle = ref("新增积分商品");
const formRef = ref();
const isEdit = ref(false);
const currentId = ref("");
const isView = ref(false);

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
  productCode: "",
  productName: "",
  productType: null,
  pointsCost: null,
  cashPrice: null,
  inventoryTotal: null,
  inventoryAvailable: null,
  limitPerUser: null,
  validDays: null,
  imageUrl: "",
  status: null,
  productDesc: "",
});

// 表单验证规则
const rules = {
  // productCode: [{ required: true, message: "请输入商品编码", trigger: "blur" }],
  productName: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  productType: [{ required: true, message: "请选择商品类型", trigger: "change" }],
  categoryId: [{ required: true, message: "请输入分类ID", trigger: "blur" }],
  pointsCost: [{ required: true, message: "请输入所需积分", trigger: "blur" }],
  inventoryTotal: [{ required: true, message: "请输入总库存", trigger: "blur" }],
  // inventoryAvailable: [{ required: true, message: "请输入可用库存", trigger: "blur" }],
  status: [{ required: true, message: "请选择商品状态", trigger: "change" }],
};

// 获取商品类型颜色
const getProductTypeColor = type => {
  const colors = {
    1: "blue",
    2: "green",
    3: "orange",
    4: "purple",
  };
  return colors[type] || "default";
};

// 获取商品类型文本
const getProductTypeText = type => {
  const texts = {
    1: "实物",
    2: "虚拟",
    3: "优惠券",
    4: "服务",
  };
  return texts[type] || "未知";
};

// 获取状态颜色
const getStatusColor = status => {
  const colors = {
    0: "default",
    1: "green",
    2: "red",
  };
  return colors[status] || "default";
};

// 获取状态文本
const getStatusText = status => {
  const texts = {
    0: "下架",
    1: "上架",
    2: "售罄",
  };
  return texts[status] || "";
};

// 获取积分商品列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      productName: searchValue.value,
    };

    const response = await getPointsProducts(params);
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
  modalTitle.value = "新增积分商品";
  isEdit.value = false;
  isView.value = false;
  modalVisible.value = true;
  nextTick(() => {
    resetForm();
  });
};

// 编辑
const handleEdit = record => {
  modalTitle.value = "编辑积分商品";
  isEdit.value = true;
  isView.value = false;
  currentId.value = record.id;
  formState.value = { ...record };
  modalVisible.value = true;
};
const handleView = record => {
  modalTitle.value = "查看积分商品";
  // viewing mode: read-only
  isView.value = true;
  isEdit.value = false;
  currentId.value = record.id;
  formState.value = { ...record };
  modalVisible.value = true;
};

// 删除
const handleDelete = async id => {
  try {
    await deletePointsProduct(id);
    message.success("删除成功");
    fetchData();
  } catch (error) {
    message.error("删除失败");
  }
};
// 上架
const handleUp = async record => {
  updatePointsProductStatus({ ...record, id: record.id, status: 1 }).then(() => {
    message.success("操作成功");
    fetchData();
  });
};
// 下架
const handleDown = async record => {
  updatePointsProductStatus({...record, id: record.id, status: 0 }).then(() => {
    message.success("操作成功");
    fetchData();
  });
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    if (!selectedRowKeys.value.length) {
      message.warning("请选择要删除的商品");
      return;
    }
    await deletePointsProduct(selectedRowKeys.value.join(","));
    message.success("删除成功");
    selectedRowKeys.value = [];
    tableSelectedRows.value = [];
    fetchData();
  } catch (error) {
    message.error("批量删除失败");
  }
};

// 提交表单
const handleModalOk = async () => {
  try {
    // 如果是查看模式，直接关闭
    if (isView.value) {
      modalVisible.value = false;
      resetForm();
      isView.value = false;
      return;
    }

    await formRef.value?.validate();
    if (isEdit.value) {
      await updatePointsProduct({
        id: currentId.value,
        ...formState.value,
      });
    } else {
      await addPointsProduct(formState.value);
    }
    message.success(isEdit.value ? "更新成功" : "新增成功");
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
    productCode: "",
    productName: "",
    productType: null,
    pointsCost: null,
    cashPrice: null,
    inventoryTotal: null,
    inventoryAvailable: null,
    limitPerUser: null,
    validDays: null,
    imageUrl: "",
    status: null,
    productDesc: "",
  };
  currentId.value = "";
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.points-product {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
