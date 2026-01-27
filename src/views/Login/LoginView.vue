<template>
	<div class="login-container">
		<div class="login-box">
			<div class="login-title">积分系统</div>
			<a-form :model="formState" @finish="onFinish">
				<a-form-item name="username" :rules="[{ required: true, message: '用户名不能为空!' }]">
					<a-input v-model:value="formState.username" placeholder="请输入用户名">
					</a-input>
				</a-form-item>

				<a-form-item name="password" :rules="[{ required: true, message: '密码不能为空!' }]">
					<a-input-password v-model:value="formState.password" placeholder="请输入密码">
					</a-input-password>
				</a-form-item>
				<a-form-item name="captcha" :rules="[{ required: true, message: '验证码不能为空!' },{
					pattern: /^[A-Za-z0-9]+$/, message: '验证码格式不正确!'
				}]">
					<div class="captcha-container">
						<a-input v-model:value="formState.captcha" placeholder="请输入验证码" class="captcha-input"></a-input>
						<img :src="captchaCode" @click="handleChangeCaptcha" alt="" class="code-image" />
						<div @click="handleChangeCaptcha" type="text" class="change-captcha">换一张</div>
					</div>
				</a-form-item>

				<a-form-item>
					<a-button html-type="submit" :loading="loading" block class="login-button"> 登录 </a-button>
				</a-form-item>
			</a-form>
		</div>
	</div>
</template>

<script setup>
import { createCaptcha } from "@/api/login";
import { useUserStore } from "@/store/user.js";
import { message } from "ant-design-vue";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const formState = reactive({
	username: "",
	password: "",
	captcha: "",
	codeToken: "", // 用于存储验证码令牌
});
const captchaCode = ref("");

const loading = ref(false);

const onFinish = async values => {
	loading.value = true;
	try {
		await userStore.login({
			username: values.username,
			password: values.password,
		});
		message.success("登录成功！");

		// 获取重定向路径或默认跳转到首页
		const redirectPath = router.currentRoute.value.query.redirect || "/system/user";
		router.push(redirectPath);
	} catch (error) {
		console.error("登录失败:", error);
		message.error(error.message || "用户名或密码错误");
	} finally {
		loading.value = false;
	}
};
// 获取验证码
const handleChangeCaptcha = async () => {
	const res = await createCaptcha();
	const { data } = res;
	captchaCode.value = "data:image/png;base64," + data.img;
	formState.codeToken = data.codeToken; // 保存验证码令牌
};
</script>

<style lang="less" scoped>
.login-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: url("@/assets/images/login-bg.png") no-repeat top center;
}
.login-box {
	width: 400px;
	margin: 0 auto;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	box-shadow: 0px 4px 20px 0px #dce0e3;
	box-sizing: border-box;
	padding: 20px;
	background-color: #fff;
	.login-title {
		font-size: 30px;
		font-weight: 600;
		text-align: center;
		margin-bottom: 30px;
	}
}
// 设置form_-item的间距 18px
.ant-form-item {
	margin-bottom: 18px;
}
.login-button {
	width: 100%;
	height: 50px;
	line-height: 50px;
	font-size: 14px;
	color: #fff;
	text-align: center;
	/* background: #05aeff; */
	background: #d90b0b;
	border-radius: 5px;
	display: block;
	margin-top: 40px;
	&:hover {
		background-color: #d90b0b;
		border-color: #d90b0b;
	}
}
.captcha-container {
	display: flex;
	align-items: center;
	gap: 10px;
	.captcha-input {
		flex: 1;
	}
	.code-image {
		width: 90px;
		height: 40px;
		cursor: pointer;
	}
  .change-captcha {
    cursor: pointer;
    color: #1890ff;
    width: 58px;
  }
}
.ant-form {
	.ant-input,
	.ant-input-affix-wrapper {
		height: 42px;
	}
}
</style>
