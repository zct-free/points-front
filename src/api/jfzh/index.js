import request from "@/utils/request.js";
// 积分流水入账
export const jfzhJflsApi = (params) => {
  return request({
    url: "/points/pointsStream/enter",
    method: "get",
    params,
  });
};
// 积分流水出账
export const jfzhJfczApi = (params) => {
  return request({
    url: "/points/pointsStream/leave",
    method: "get",
    params,
  });
};
