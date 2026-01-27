import request from "@/utils/request.js";

export const deletePointsAccount = ids => {
  console.log(ids);
  const idsStr = ids.join(",");
  return request({
    method: "delete",
    url: `/account/${idsStr}`,
  });
};

export const getPointsAccounts = params => {
  return request.get("/account/list", { params });
};
export const addPointsAccount = params => {
  return request.post("/account/add", params);
};
export const updatePointsAccount = params => {
  return request.put("/account/update", params);
};
