import request from "@/utils/request.js";

// 获取验证码
export const createCaptcha = () => {
  return request.get("/captcha");
};
// 登录接口
export const loginApi = params => {
  return request.post("/auth/login", params);
};
// 获取用户信息
export const getUserInfoApi = () => {
  return request({
    url: "/system/user/getInfo",
    method: "get",
  });
};
