<template>
  <div class="friends-ranking">
    <a-space>
      <label>用户ID：</label>
      <a-input-search v-model:value="searchValue" placeholder="输入用户id搜索" @search="fetchData" />
      <!-- <a-button type="primary" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        添加好友
      </a-button>
      <a-button danger :disabled="!selectedRowKeys.length" @click="handleBatchDelete">
        <template #icon><delete-outlined /></template>
        批量删除
      </a-button> -->
    </a-space>

    <a-table :columns="columns" :dataSource="data" :pagination="pagination" bordered class="table-operations">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-space>
            <a @click="handleChat(record)">发消息</a>
            <a-popconfirm title="确定要删除该好友吗?" @confirm="handleDelete(record.id)">
              <a style="color: red">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else-if="column.key === 'rankPosition'">
          <a-tag :color="getRankColor(record.rankPosition)">
            {{ record.rankPosition }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'avatarUrl'">
          <a-avatar :src="record.avatarUrl" />
        </template>
        <template v-else-if="column.key === 'onlineStatus'">
          <a-tag :color="record.onlineStatus === '在线' ? 'green' : 'default'">
            {{ record.onlineStatus }}
          </a-tag>
        </template>
      </template>
    </a-table>

    <!-- 添加好友模态框 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="500px" @ok="handleModalOk" @cancel="resetForm">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="好友ID" name="friendId">
          <a-input v-model:value="formState.friendId" placeholder="请输入好友ID" />
        </a-form-item>
        <a-form-item label="好友名称" name="friendName">
          <a-input v-model:value="formState.friendName" placeholder="请输入好友名称" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-input v-model:value="formState.remark" placeholder="请输入备注信息" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { addFriend, deleteFriend, getFriendsList, updateFriend } from "@/api/point/friends/index";
import { message } from "ant-design-vue";
import { onMounted, ref } from "vue";

// 表格列配置
const columns = [
  {
    title: "排名",
    dataIndex: "rank",
    key: "rank",
  },
  //   {
  //     title: '头像',
  //     dataIndex: 'avatarUrl',
  //     key: 'avatarUrl',
  //     width: 80
  //   },
  {
    title: "好友名称",
    dataIndex: "nickName",
    key: "nickName",
  },
  {
    title: "备注",
    dataIndex: "remark",
    key: "remark",
  },
  {
    title: "积分余额",
    dataIndex: "points",
    key: "points",
  },
  {
    title: "最后活跃时间",
    dataIndex: "lastLoginTime",
    key: "lastLoginTime",
  },
  // {
  //   title: "操作",
  //   key: "operation",
  //   fixed: "right",
  // },
];

// 数据状态
const data = ref([]);
const loading = ref(false);
const searchValue = ref("");
const selectedRowKeys = ref([]);
const modalVisible = ref(false);
const modalTitle = ref("添加好友");
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
  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    fetchData();
  },
});

// 表单数据
const formState = ref({
  friendId: "",
  friendName: "",
  remark: "",
});

// 表单验证规则
const rules = {
  friendId: [{ required: true, message: "请输入好友ID", trigger: "blur" }],
  friendName: [{ required: true, message: "请输入好友名称", trigger: "blur" }],
};

// 获取排名颜色
const getRankColor = position => {
  if (position === 1) return "gold";
  if (position === 2) return "silver";
  if (position === 3) return "#cd7f32";
  return "default";
};

// 获取好友列表
const fetchData = async () => {
  try {
    loading.value = true;

    const params = {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      userId: searchValue.value,
    };

    // 调用后端API
    const response = await getFriendsList(params);
    data.value = response.data || [];
    pagination.value.total = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 添加好友
const handleAdd = () => {
  modalTitle.value = "添加好友";
  isEdit.value = false;
  resetForm();
  modalVisible.value = true;
};

// 发消息
const handleChat = record => {
  message.info(`开始与 ${record.friendName} 聊天`);
  // 这里可以跳转到聊天页面或打开聊天窗口
};

// 删除
const handleDelete = async id => {
  try {
    await deleteFriend([id]);
    message.success("删除成功");
    fetchData();
  } catch (error) {
    console.error("删除失败:", error);
    message.error("删除失败");
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    if (!selectedRowKeys.value.length) {
      message.warning("请选择要删除的好友");
      return;
    }

    await deleteFriend(selectedRowKeys.value);
    message.success(`成功删除${selectedRowKeys.value.length}位好友`);
    selectedRowKeys.value = [];
    fetchData();
  } catch (error) {
    console.error("批量删除失败:", error);
    message.error("批量删除失败");
  }
};

// 提交表单
const handleModalOk = async () => {
  try {
    await formRef.value?.validate();

    if (isEdit.value) {
      await updateFriend({
        id: currentId.value,
        ...formState,
      });
      message.success("更新成功");
    } else {
      await addFriend(formState);
      message.success("添加成功");
    }

    modalVisible.value = false;
    resetForm();
    fetchData();
  } catch (error) {
    console.error("表单提交失败:", error);
    message.error(error.message || "表单提交失败");
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  Object.assign(formState, {
    friendId: "",
    friendName: "",
    remark: "",
  });
  currentId.value = "";
};

// 初始化加载数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="less">
.friends-ranking {
  .table-operations {
    margin: 16px 0;
  }
}
</style>
