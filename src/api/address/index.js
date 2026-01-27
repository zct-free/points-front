import request from "@/utils/request.js";

//积分商品
export const deleteShippingAddress = ids => {
  return request({
    method: "delete",
    url: `/points/address/remove`,
    params: {
      ids: ids,
    },
  });
};

export const getShippingAddresses = params => {
  return request.get("/points/address/list", { params });
};
export const addShippingAddress = params => {
  return request.post("/points/address/save", params);
};
export const updateShippingAddress = params => {
  return request.put("/points/address/update", params);
};
