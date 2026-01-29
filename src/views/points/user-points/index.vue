<template>
  <div class="points-ranking">
    <a-form :model="searchForm" ref="searchFormRef">
      <a-row :gutter="16">
        <a-col span="5">
          <a-form-item label="用户搜索">
            <a-input v-model:value="searchForm.nickName" placeholder="输入用户昵称搜索" />
          </a-form-item>
        </a-col>
        <a-col span="5">
          <a-form-item label="排序方式" name="orderColumn">
            <a-select v-model:value="searchForm.orderColumn" placeholder="选择排序方式">
              <a-select-option value="availablePoints">当前积分排序</a-select-option>
              <a-select-option value="points">累计积分排序</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col span="4">
          <a-form-item>
            <div class="search-form-btns">
              <a-button type="primary" @click="fetchData">搜索</a-button>
              <a-button @click="resetForm">重置</a-button>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <a-table
      :columns="columns"
      :dataSource="data"
      :pagination="pagination"
      bordered
      class="table-operations"
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'level'">
          <a-tag :color="getLevelColor(record.level)">{{ levelMap[record.level] || "未知" }}</a-tag>
        </template>
        <template v-else-if="column.key === 'avatar'">
          <a-avatar :src="record.avatar" />
        </template>
        <template v-if="column.key === 'operation'">
          <a-button @click="handleViewFriends(record)" type="link">查看好友排行</a-button>
        </template>
      </template>
    </a-table>

    <!-- 好友排行Modal -->
    <FriendsRankingModal v-model:visible="friendsRankingVisible" :userId="selectedUserId" :currentUser="currentUser" />
  </div>
</template>

<script setup>
import { getPointsRankings } from "@/api/point/ranking";
import dayjs from "dayjs";
import { onMounted, ref } from "vue";
import FriendsRankingModal from "./FriendsRankingModal/index.vue";

const levelMap = {
  0: "普通会员",
  1: "白银会员",
  2: "黄金会员",
  3: "铂金会员",
  4: "钻石会员",
};
// 表格列配置
const columns = [
  {
    title: "用户昵称",
    dataIndex: "nickName",
    key: "nickName",
  },
  {
    title: "头像",
    dataIndex: "avatar",
    key: "avatar",
    width: 80,
  },
  {
    title: "当前积分",
    dataIndex: "availablePoints",
    key: "availablePoints",
  },

  {
    title: "总积分",
    dataIndex: "points",
    key: "points",
  },
  {
    title: "用户等级",
    dataIndex: "level",
    key: "level",
  },
  {
    title: "最后登录时间",
    dataIndex: "updateTime",
    key: "updateTime",
    customRender: ({ text }) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""),
  },
  {
    title: "操作",
    key: "operation",
    width: 100,
    fixed: "right",
  },
];

// 数据状态
const data = ref([]);
const loading = ref(false);
const searchValue = ref(null);
const searchForm = ref({
  nickName: "",
  orderColumn: "availablePoints",
});
// Modal相关状态
const friendsRankingVisible = ref(false);
const selectedUserId = ref("");

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

// 获取用户等级颜色
const getLevelColor = level => {
  const colors = {
    初级: "blue",
    中级: "green",
    高级: "orange",
    白金: "purple",
    钻石: "magenta",
  };
  return colors[level] || "default";
};

// 获取积分排行列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current - 1,
      pageSize: pagination.value.pageSize,
      nickName: searchForm.value.nickName,
      orderColumn: searchForm.value.orderColumn,
    };

    const response = await getPointsRankings(params);

    data.value = response?.data || [];
    pagination.value.total = response?.total;
  } finally {
    loading.value = false;
  }
};
const currentUser = ref();
const handleViewFriends = record => {
  selectedUserId.value = record.id;
  friendsRankingVisible.value = true;
  currentUser.value = record;
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.points-ranking {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
