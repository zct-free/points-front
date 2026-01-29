<template>
  <div class="points-exchange">
    <div>
      <a-form :model="searchForm" ref="searchFormRef">
        <a-row :gutter="16">
          <a-col :span="4">
            <a-form-item label="商品名称" name="productName">
              <a-input v-model:value="searchForm.productName" placeholder="输入商品名称搜索"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="商品类型" name="orderStatus">
              <a-select v-model:value="searchForm.orderStatus" placeholder="请选择商品类型">
                <a-select-option value="">全部类型</a-select-option>
                <a-select-option value="1">虚拟商品</a-select-option>
                <a-select-option value="2">实体商品</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="4">
            <a-form-item label="发货状态" name="sortBy">
              <a-select v-model:value="searchForm.sortBy" placeholder="请选择排序方式">
                <a-select-option value="pointsConsume_asc">全部</a-select-option>
                <a-select-option value="pointsConsume_asc">已发货</a-select-option>
                <a-select-option value="pointsConsume_desc">未发货</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="4">
            <a-form-item>
              <div class="search-form-btns">
                <a-button type="primary" @click="fetchData"> 查询 </a-button>
                <a-button @click="resetSearch"> 重置 </a-button>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <a-table :columns="columns" :dataSource="data" :pagination="pagination" bordered :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-button type="link" @click="handleView(record)">兑换记录</a-button>
        </template>
      </template>
    </a-table>
    <ExchangeRecord v-model:visible="exchangeRecordVisible" :selectRecord="selectRecord" />
  </div>
</template>

<script setup>
import { getPointsExchangeOrders } from "@/api/exchange/index";
import { onMounted, ref } from "vue";
import ExchangeRecord from "./ExchangeRecord.vue";

// 表格列配置
const columns = [
  {
    title: "兑换编号",
    dataIndex: "productName",
    key: "productName",
  },
  {
    title: "商品名称",
    dataIndex: "productName",
    key: "productName",
  },
  {
    title: "商品类型",
    dataIndex: "",
    key: "",
  },
  {
    title: "消耗积分",
    dataIndex: "pointsConsume",
    key: "pointsConsume",
  },
  {
    title: "发货状态",
    dataIndex: "orderStatus",
    key: "orderStatus",
  },

  {
    title: "操作",
    key: "operation",
  },
];

// 数据状态
const data = ref([
  {
    productName: "测试商品1",
    productType: "虚拟商品",
    pointsConsume: 100,
    orderStatus: "已处理",
  },
  {
    productName: "测试商品2",
    productType: "实体商品",
    pointsConsume: 200,
    orderStatus: "未处理",
  },
]);
const loading = ref(false);
// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: total => `共 ${total} 条`,

  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchData();
  },
});

// 表单数据
const searchForm = ref({
  productName: null,
  orderStatus: null,
  sortBy: null,
});

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
const resetSearch = () => {
  searchForm.value = {
    productName: null,
    orderStatus: null,
    sortBy: null,
  };
  pagination.value.current = 1;
  fetchData();
};

// 初始化加载数据
onMounted(() => {
  // fetchData();
});
const selectRecord = ref(null);
const exchangeRecordVisible = ref(false);
const handleView = record => {
  selectRecord.value = record;
  exchangeRecordVisible.value = true;
};
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
