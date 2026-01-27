<template>
  <div class="security-management">
    <a-card title="">
      <a-form
        :model="passwordForm"
        :label-col="{ sm: { span: 6 }, md: { span: 7 } }"
        :wrapper-col="{ sm: { span: 12 }, md: { span: 12 } }"
        @finish="handlePasswordSubmit"
        ref="passwordFormRef"
      >
        <a-form-item label="原始密码:" name="oldPassword">
          <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入原始密码" />
        </a-form-item>
        <a-form-item label="新密码:" name="newPassword" class="password-new">
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
          <div class="password-tips tips">新密码长度6~16位</div>
        </a-form-item>

        <a-form-item label="请在此输入新密码:" name="confirmPassword">
          <a-input-password
            v-model:value="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
            :maxlength="20"
          />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 12 }">
          <a-space>
            <a-button @click="handleReset" type="primary">重置</a-button>
            <a-button type="primary" html-type="submit" :loading="loading"> 保存 </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    <div class="tips">*密码修改后需重新登录</div>
  </div>
</template>

<script setup>
import { message } from "ant-design-vue";
import { ref } from "vue";

// 表单引用
const passwordFormRef = ref();

// 加载状态
const loading = ref(false);

// 密码表单
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 提交表单
const handlePasswordSubmit = async () => {
  loading.value = true;
  try {
    // 这里调用修改密码的API
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用

    message.success("密码修改成功！");
    handleReset();
  } catch (error) {
    message.error("密码修改失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  passwordFormRef.value?.resetFields();
};
</script>

<style lang="less" scoped>
.security-management {
  padding: 24px;
}
.password-new {
  position: relative;
  .password-tips {
    position: absolute;
    top: 0;
    left: 102%;
    color: @primary-color;
    width: max-content;
    font-size: .px2rem(16) [];
  }
}
.password-strength {
  color: @primary-color;
}
.tips {
  margin-top: 10px;
  color: @primary-color;
}
</style>
