import request from "@/utils/request.js";

// 删除信心接口
export const deleteUser = ids => {
  return request({
    method: "delete",
    url: `/points/account/remove`,
    params: {
      ids: ids,
    },
  });
};
// 获取账户列表信息接口
export const getUserInfo = params => {
  return request("/points/account/list", {
    params,
  });
};
export const getPointDetails = params => {
  return request("/transaction/allList", {
    params,
  });
};

// 新增账户列表信息接口
export const addUserInfo = params => {
  return request.post("/points/account/save", params);
};
// 修改账户列表信息接口
export const updateUserInfo = params => {
  return request.put("/points/account/update", params);
};

//积分流水组件相关接口
export const deleteU = ids => {
  console.log(ids);
  const idsStr = ids.join(",");
  return request({
    method: "delete",
    url: `/transaction/${idsStr}`,
  });
};
// 获取账户列表信息接口
export const getU = params => {
  return request("/transaction/list", {
    params,
  });
};
export const getU2 = params => {
  return request("/transaction/list2", {
    params,
  });
};
// 新增账户列表信息接口
export const addU = params => {
  console.log(params, "1111111111111111");
  return request.post("/transaction/add", params);
};
// 修改账户列表信息接口
export const updateU = params => {
  return request.put("/transaction/update", params);
};
//积分菜单
export const getMenu = () => {
  return request.get("/jifen/menu");
};
