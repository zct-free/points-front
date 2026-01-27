import request from "@/utils/request.js";

//积分兑换
export const deletePointsExchangeOrder = ids => {
  return request({
    method: "delete",
    url: `/points/trade/batchDelete`,
    data: ids,
  });
};
export const getOrderShippingAddress = params => {
  return request.get("/order/list", { params });
};
export const getPointsExchangeOrders = params => {
  return request.get("/points/trade/list", { params });
};
export const addPointsExchangeOrder = params => {
  return request.post("/points/trade/add", params);
};
export const updatePointsExchangeOrder = params => {
  return request.put("/points/trade/update", params);
};
