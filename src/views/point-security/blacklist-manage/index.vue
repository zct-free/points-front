<template>
  <div class="blacklist">
    <a-space>
      <label> 用户昵称: </label>
      <a-input-search
        v-model:value="searchValue"
        placeholder="用户昵称"
        style="width: 200px"
        @change="searchFn"
        @search="searchFn"
      />

      <!-- <a-input v-model:value="newBlacklist.reason" placeholder="拉黑原因" style="width: 180px" /> -->
      <!-- <a-button type="primary" danger @click="handleAddBlacklist"> 添加黑名单 </a-button> -->
    </a-space>
    <a-table
      :columns="columns"
      :dataSource="data"
      :pagination="pagination"
      bordered
      class="table-operations"
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-space>
            <a-popconfirm title="确定要移出黑名单吗?" @confirm="() => handleRemove(record.id)">
              <a-button>移除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else-if="column.key === 'historyCount'">
          <a-tag color="orange">{{ record.historyCount }}</a-tag>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { addBlacklist, deleteBlacklist, getBlacklists } from "@/api/blacklist/index";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { debounce } from "lodash-es";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "用户昵称",
    dataIndex: "nickName",
    key: "nickName",
  },
  {
    title: "异常原因",
    dataIndex: "reason",
    key: "reason",
  },
  {
    title: "限制时间（分钟）",
    dataIndex: "blackTime",
    key: "blackTime",
  },
  {
    title: "限制类型",
    dataIndex: "restrictionType",
    key: "restrictionType",
  },
  {
    title: "拉黑时间",
    dataIndex: "banStartTime",
    key: "banStartTime",
    customRender: ({ text }) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "解封时间",
    dataIndex: "banEndTime",
    key: "banEndTime",
    customRender: ({ text }) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
  },


];

// 数据状态
const data = ref([]);
const loading = ref(false);
const searchValue = ref("");
const newBlacklist = ref({
  createUser: "",
  reason: "",
});

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

const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      nickName: searchValue.value,
    };

    const response = await getBlacklists(params);
    data.value = response.data || [];
    pagination.value.total = response.total || 0;
  } finally {
    loading.value = false;
  }
};
const searchFn = debounce(() => {
  fetchData();
}, 300);
// 添加黑名单
const handleAddBlacklist = async () => {
  if (!newBlacklist.value.createUser || !newBlacklist.value.reason) {
    message.warning("请填写完整信息！");
    return;
  }

  try {
    loading.value = true;
    await addBlacklist({
      id: "BLK" + newBlacklist.value.createUser,
      createUser: newBlacklist.value.createUser,
      reason: newBlacklist.value.reason,
    });

    message.success("添加黑名单成功");
    // 重置表单
    newBlacklist.value.createUser = "";
    newBlacklist.value.reason = "";
    // 重新获取数据
    fetchData();
  } finally {
    loading.value = false;
  }
};

// 移除黑名单
const handleRemove = async id => {
  try {
    loading.value = true;
    await deleteBlacklist(id);
    message.success("已移出黑名单");
    fetchData();
  } finally {
    loading.value = false;
  }
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.blacklist {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
