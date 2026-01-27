<template>
  <div class="add-user-container">
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <a-button @click="handleBack" type="primary">返回</a-button>
      <a-button @click="handleReset" type="primary">重置</a-button>
      <a-button type="primary" @click="handleSave">保存</a-button>
    </div>

    <!-- 表单区域 -->
    <a-card class="form-container">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{
          sm: { span: 6 },
          md: { span: 8 },
        }"
        :wrapper-col="{
          sm: { span: 18 },
          md: { span: 16 },
        }"
        layout="horizontal"
      >
        <!-- 基础信息 -->
        <div class="form-section">
          <h3 class="section-title">创建信息</h3>

          <a-row>
            <a-col :span="12">
              <a-form-item label="登录名" name="name">
                <a-input v-model:value="formData.name" placeholder="请输入登录名" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <div class="form-tips">该信息一旦保存将不能再编辑，长度不能超过50个字符</div>
            </a-col>
            <a-col :span="12">
              <a-form-item label="安全密码问题" name="gender">
                <a-input v-model:value="formData.name" placeholder="请输入安全密码问题" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <div class="form-tips">长度不能超过100个字符</div>
            </a-col>
            <a-col :span="12">
              <a-form-item label="安全密码答案" name="gender">
                <a-input v-model:value="formData.name" placeholder="请输入安全密码答案" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <div class="form-tips">长度不能超过100个字符</div>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="状态" name="status">
                <a-radio-group v-model:value="formData.status">
                  <a-radio value="active">正常</a-radio>
                  <a-radio value="inactive">停用</a-radio>
                  <a-radio value="inactive">已删除</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="是否为白名单用户" name="isWhiteList">
                <a-radio-group v-model:value="formData.isWhiteList">
                  <a-radio value="active">否</a-radio>
                  <a-radio value="inactive">是</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="所属部门" name="department">
                <a-select v-model:value="formData.department" placeholder="请选择所属部门">
                  <a-select-option value="hr">人力资源部</a-select-option>
                  <a-select-option value="it">技术部</a-select-option>
                  <a-select-option value="sales">销售部</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="12">
              <a-form-item label="职位" name="position">
                <a-input v-model:value="formData.position" placeholder="请输入职位" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <div class="form-tips">长度不能超过50个字符</div>
            </a-col>
            <a-col :span="12">
              <a-form-item label="员工工号" name="employeeId">
                <a-input v-model:value="formData.employeeId" placeholder="请输入员工工号" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <div class="form-tips">长度不能超过32个字符</div>
            </a-col>
            <a-col :span="12">
              <a-form-item label="备注" name="remark">
                <a-textarea v-model:value="formData.remark" placeholder="请输入备注" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <div class="form-tips">可以为空，如果不为空，最大长度为200个字符</div>
            </a-col>
          </a-row>
        </div>

        <!-- 用户基本信息 -->
        <div class="form-section">
          <h3 class="section-title">用户基本信息</h3>
          <a-row>
            <a-col :span="12">
              <a-form-item label="真实姓名" name="username">
                <a-input v-model:value="formData.username" placeholder="请输入真实姓名" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <div class="form-tips">长度不能超过20个字符</div>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="24">
              <a-form-item label="性别" name="gender" v-bind="formItemLayout">
                <a-radio-group v-model:value="formData.gender">
                  <a-radio value="male">男</a-radio>
                  <a-radio value="female">女</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="手机" name="password" v-bind="formItemLayout">
                <a-input v-model:value="formData.password" placeholder="请输入密码" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="密保手机" name="confirmPassword" v-bind="formItemLayout">
                <a-input v-model:value="formData.confirmPassword" placeholder="请输入密保手机" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="电话" name="phone" v-bind="formItemLayout">
                <a-input v-model:value="formData.phone" placeholder="请输入电话" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="电子邮件" name="email" v-bind="formItemLayout">
                <a-input v-model:value="formData.email" placeholder="请输入电子邮件" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="传真" name="fax" v-bind="formItemLayout">
                <a-input v-model:value="formData.fax" placeholder="请输入传真" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="地址" name="address">
                <a-textarea v-model:value="formData.address" placeholder="请输入地址" :maxlength="200" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <div class="form-tips">长度不超过200个字符</div>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
const formItemLayout = ref({
  labelCol: { sm: { span: 6 }, md: { span: 4 } },
  wrapperCol: { sm: { span: 6 }, md: { span: 8 } },
});

const router = useRouter();

const formRef = ref();

// 表单数据
const formData = reactive({
  name: "", // 登录名
  securityQuestion: "", // 安全密码问题
  securityAnswer: "", // 安全密码答案
  status: "active", // 状态
  isWhiteList: "active", // 是否为白名单用户
  department: "", // 所属部门
  position: "", // 职位
  employeeId: "", // 员工工号
  remark: "", // 备注
  username: "", // 真实姓名
  gender: "male", // 性别
  password: "", // 手机（密码字段名有误，建议改为mobile）
  confirmPassword: "", // 密保手机（建议改为securityMobile）
  phone: "", // 电话
  email: "", // 电子邮箱
  fax: "", // 传真
  address: "", // 地址
  birthDate: "", // 出生年月（实际为职位，建议字段名与表单一致）
});

// 表单验证规则
const rules = ref({
  name: [
    { required: true, message: "请输入登录名" },
    { max: 50, message: "长度不能超过50个字符" },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  isWhiteList: [{ required: true, message: "请选择是否为白名单用户", trigger: "change" }],
  department: [{ required: true, message: "请选择所属部门", trigger: "change" }],
  position: [
    { required: true, message: "请输入职位" },
    { max: 50, message: "长度不能超过50个字符" },
  ],
  employeeId: [
    { required: true, message: "请输入员工工号" },
    { max: 32, message: "长度不能超过32个字符" },
  ],
  username: [
    { required: true, message: "请输入真实姓名" },
    { max: 20, message: "长度不能超过20个字符" },
  ],
  password: [{ required: true, message: "请输入手机" }],
  confirmPassword: [{ required: true, message: "请输入密保手机" }],
  email: [
    { required: true, message: "请输入电子邮箱" },
    { type: "email", message: "请输入正确的邮箱格式" },
  ],
});
const loading = ref(false);
// 保存用户
const handleSave = async () => {
  formRef.value
    ?.validateFields()
    .then(() => {
      loading.value = true;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields();
};

const handleBack = () => {
  router.replace("/system/user");
};
</script>

<style scoped lang="less">
.add-user-container {
  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #262626;
    }
  }

  .action-buttons {
    margin: 20px 0;
    .ant-btn {
      margin-right: 12px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .form-container {
    .form-section {
      margin-bottom: 32px;

      .section-title {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
        color: #262626;
        border-left: 4px solid #1890ff;
        padding-left: 12px;
      }
    }

    :deep(.ant-form-item-label) {
      font-weight: 500;
    }

    :deep(.ant-form-item) {
      margin-bottom: 16px;
    }

    :deep(.ant-radio-group) {
      .ant-radio-wrapper {
        margin-right: 16px;
      }
    }

    :deep(.ant-select),
    :deep(.ant-input),
    :deep(.ant-date-picker) {
      width: 100%;
    }
  }
}

// 响应式布局
@media (max-width: 768px) {
  .add-user-container {
    padding: 16px;

    :deep(.ant-form) {
      .ant-col {
        width: 100% !important;
        max-width: 100% !important;
      }
    }

    :deep(.ant-form-item-label) {
      text-align: left;
    }
  }
}
.form-tips {
  color: #e21313;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 20px;
}
</style>
