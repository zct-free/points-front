<template>
  <a-modal v-model:visible="visible" title="好友积分排行" width="800px" :footer="null" @cancel="handleCancel">
    <div class="friends-ranking-modal">
      <!-- 搜索区域 -->
      <div class="search-section">
        <a-space>
          <label>搜索好友：</label>
          <a-input-search
            v-model:value="searchValue"
            placeholder="输入好友名称搜索"
            @search="handleSearch"
            style="width: 200px"
          />
        </a-space>
      </div>

      <!-- 排行榜区域 -->
      <div class="ranking-section">
        <a-table
          :columns="columns"
          :dataSource="dataSource"
          :pagination="pagination"
          bordered
          :loading="loading"
          size="small"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'rank'">
              <div class="rank-cell">
                <a-tag :color="getRankColor(index + 1)" class="rank-tag">
                  {{ index + 1 }}
                </a-tag>
                <div v-if="index < 3" class="rank-icon">
                  <CrownOutlined v-if="index === 0" style="color: #ffd700" />
                  <TrophyOutlined v-if="index === 1" style="color: #c0c0c0" />
                  <TrophyOutlined v-if="index === 2" style="color: #cd7f32" />
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'avatar'">
              <a-avatar :src="record.avatar" :size="32">
                {{ record.nickName?.charAt(0) }}
              </a-avatar>
            </template>
            <template v-else-if="column.key === 'points'">
              <span class="points-text">{{ record.points.toLocaleString() }}</span>
            </template>
            <template v-else-if="column.key === 'level'">
              <a-tag>
                {{ levelMap[record.level] || "普通会员" }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'trend'">
              <div class="trend-cell">
                <ArrowUpOutlined v-if="record.trend > 0" style="color: #52c41a" />
                <ArrowDownOutlined v-else-if="record.trend < 0" style="color: #ff4d4f" />
                <MinusOutlined v-else style="color: #d9d9d9" />
                <span :class="getTrendClass(record.trend)">
                  {{ Math.abs(record.trend) }}
                </span>
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-statistic title="好友总数" :value="stats.totalFriends" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="平均积分" :value="stats.avgPoints" :precision="0" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="最高积分" :value="stats.maxPoints" />
          </a-col>
        </a-row>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CrownOutlined,
  MinusOutlined,
  TrophyOutlined,
} from "@ant-design/icons-vue";
import { ref, watchEffect } from "vue";
import { getFriendsRank, getFriendsPointsStats } from "@/api/point/friends";
import dayjs from "dayjs";
const levelMap = {
  0: "普通会员",
  1: "白银会员",
  2: "黄金会员",
  3: "铂金会员",
  4: "钻石会员",
};
const props = defineProps({
  currentUser: {
    type: Object,
    required: true,
  },
});
const visible = defineModel("visible", {
  default: false,
});
// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,

  showTotal: total => `共 ${total} 条`,
  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchData();
  },
});
// 响应式数据
const searchValue = ref("");
const loading = ref(false);
const fetchData = async () => {
  loading.value = true;
  const params = {
    nickName: searchValue.value,
    guid: props.currentUser.guid,
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
  };
  const res = await getFriendsRank(params);
  pagination.value.total = res?.total || 0;
  dataSource.value = res?.data || [];
  loading.value = false;
};
watchEffect(() => {
  if (visible.value) {
    fetchData();
    getStats();
  }
});
const stats = ref({});
const getStats = async () => {
  const params = {
    guid: props.currentUser.guid,
  };
  const res = await getFriendsPointsStats(params);
  stats.value = res?.data;
};
const dataSource = ref([]);

// 表格列配置
const columns = [
  {
    title: "排名",
    dataIndex: "rank",
    key: "rank",
  },
  {
    title: "头像",
    dataIndex: "avatar",
    key: "avatar",
  },
  {
    title: "好友昵称",
    dataIndex: "nickName",
    key: "nickName",
  },
  {
    title: "积分",
    dataIndex: "points",
    key: "points",
  },
  {
    title: "等级",
    dataIndex: "level",
    key: "level",
  },

  {
    title: "最后活跃",
    dataIndex: "updateTime",
    key: "updateTime",
    customRender: ({ text }) => {
      return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
    },
  },
];

// 方法
const getRankColor = rank => {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "#cd7f32";
  return "default";
};

const getTrendClass = trend => {
  if (trend > 0) return "trend-up";
  if (trend < 0) return "trend-down";
  return "trend-neutral";
};

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
};

const handleCancel = () => {
  searchValue.value = "";
};
</script>

<style scoped lang="less">
.friends-ranking-modal {
  .search-section {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #fafafa;
    border-radius: 6px;
  }

  .ranking-section {
    margin-bottom: 16px;
  }

  .stats-section {
    padding: 16px;
    background-color: #f9f9f9;
    border-radius: 6px;
  }

  .rank-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .rank-tag {
      font-weight: bold;
    }

    .rank-icon {
      font-size: 16px;
    }
  }

  .points-text {
    font-weight: bold;
    color: #1890ff;
  }

  .trend-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .trend-up {
      color: #52c41a;
      font-weight: bold;
    }

    .trend-down {
      color: #ff4d4f;
      font-weight: bold;
    }

    .trend-neutral {
      color: #d9d9d9;
    }
  }
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px;
}

:deep(.ant-statistic-title) {
  font-size: 12px;
  color: #666;
}

:deep(.ant-statistic-content) {
  font-size: 16px;
  font-weight: bold;
}
</style>
