<template>
  <div class="points-account">
    <a-space>
      <label> 群组名称: </label>
      <a-input-search v-model:value="searchValue" placeholder="输入群组名称搜索" @search="fetchData" />
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
        <template v-if="column.key === 'groupCover'">
          <a-avatar :src="record?.groupCover" />
        </template>
        <template v-if="column.key === 'operation'">
          <a-space>
            <a @click="handleViewMembers(record)">查看</a>
          </a-space>
        </template>
      </template>
    </a-table>
    <!-- 查看群组成员积分模态框 -->
    <a-modal v-model:visible="modalVisible" title="查看群组成员积分" width="800px" :footer="null" destroyOnClose>
      <div class="member-points-header">
        <h3>{{ currentGroup.groupName }} - 成员积分详情</h3>
        <div class="group-summary">
          <div class="summary-item">
            <div>群组总积分</div>
            <div>{{ currentGroup.totalPoints || 0 }}</div>
          </div>
          <div class="summary-item">
            <div>成员数量</div>
            <div>{{ currentGroup.memberCount || 0 }}</div>
          </div>
        </div>
      </div>

      <a-table
        :columns="memberColumns"
        :dataSource="memberData"
        :loading="memberLoading"
        :pagination="memberPagination"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'rank'">
            {{ memberPagination.current * memberPagination.pageSize - memberPagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'level'">
            <a-tag>{{ levelMap[record.level] || "普通会员" }}</a-tag>
          </template>
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record?.avatar" size="small" />
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import { getGroupMemberRank, getGroupPointsRanking } from "@/api/point/ranking";
import { onMounted, ref } from "vue";
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
    title: "群组ID",
    dataIndex: "groupId",
    key: "groupId",
  },
  {
    title: "群组名称",
    dataIndex: "groupName",
    key: "groupName",
  },
  {
    title: "群头像",
    dataIndex: "groupCover",
    key: "groupCover",
  },
  {
    title: "群组积分",
    dataIndex: "totalPoints",
    key: "totalPoints",
  },
  {
    title: "可用积分",
    dataIndex: "avaPoints",
    key: "avaPoints",
  },
  {
    title: "群组成员数量",
    dataIndex: "memberCount",
    key: "memberCount",
  },

  {
    title: "排名",
    dataIndex: "rank",
    key: "rank",
  },

  {
    title: "操作",
    key: "operation",
  },
];

// 成员积分表格列配置
const memberColumns = [
  {
    title: "排名",
    dataIndex: "rank",
    key: "rank",
    width: 80,
  },
  {
    title: "头像",
    dataIndex: "avatar",
    key: "avatar",
    width: 80,
  },
  {
    title: "用户昵称",
    dataIndex: "nickName",
    key: "nickName",
    width: 120,
  },
  {
    title: "用户等级",
    dataIndex: "level",
    key: "level",
    width: 120,
  },
  {
    title: "当前积分",
    dataIndex: "availablePoints",
    key: "availablePoints",
    width: 100,
  },
  {
    title: "累计积分",
    dataIndex: "points",
    key: "points",
    width: 100,
  },
  // {
  //   title: "今日积分",
  //   dataIndex: "todayPoints",
  //   key: "todayPoints",
  //   width: 100,
  // },
  // {
  //   title: "本周积分",
  //   dataIndex: "weekPoints",
  //   key: "weekPoints",
  //   width: 100,
  // },
  // {
  //   title: "本月积分",
  //   dataIndex: "monthPoints",
  //   key: "monthPoints",
  //   width: 100,
  // },
];

// 数据状态
const data = ref([]);
const loading = ref(false);
const searchValue = ref("");
const modalVisible = ref(false);

// 群组成员积分相关数据
const currentGroup = ref({
  groupId: "",
  groupName: "",
  totalPoints: 0,
  todayPoints: 0,
  weekPoints: 0,
  monthPoints: 0,
  memberCount: 0,
});
const memberData = ref([]);
const memberLoading = ref(false);

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => {
    return `共 ${total} 条`;
  },
  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchData();
  },
});

// 成员积分分页配置
const memberPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => {
    return `共 ${total} 条`;
  },
  onChange: (page, pageSize) => {
    memberPagination.value.current = page;
    memberPagination.value.pageSize = pageSize;
    getDetail();
  },
});

// 获取群组积分排行列表
const fetchData = async () => {
  try {
    loading.value = true;
    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      groupName: searchValue.value,
      orderType:2

    };

    const response = await getGroupPointsRanking(params);

    data.value = response.data || [];
    pagination.value.total = response?.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleViewMembers = async record => {
  currentGroup.value = { ...record };
  modalVisible.value = true;
  memberPagination.value.current = 1;
  getDetail();
};
const getDetail = async params => {
  try {
    memberLoading.value = true;
    const params = {
      groupId: currentGroup.value.groupId,
      pageNo: memberPagination.value.current,
      pageSize: memberPagination.value.pageSize,
    };
    const response = await getGroupMemberRank(params);
    memberData.value = response.data || [];
    memberPagination.value.total = response?.total || 0;
  } finally {
    memberLoading.value = false;
  }
};
// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.points-account {
  .table-operations {
    margin: 16px 0;
  }
}

.member-points-header {
  margin-bottom: 16px;

  .group-summary {
    display: flex;
    gap: 20px;
    margin-top: 10px;

    .summary-item {
      background: #f9f9f9;
      padding: 10px 15px;
      border-radius: 4px;
      min-width: 100px;
      text-align: center;
    }
  }
}
</style>
