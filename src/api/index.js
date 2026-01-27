import request from "@/utils/request.js";

export const getMenusApi = params => {
  return request({
    url: "/system/menu/getRoutersByMenuId",
    method: "get",
    params,
  });
};
