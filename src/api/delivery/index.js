import request from "@/utils/request.js";

export const deleteShippingDelivery = ids => {
  return request({
    method: "delete",
    url: `/points/delivery/remove`,
    params: {
      ids: ids,
    },
  });
};

export const getShippingDeliveries = params => {
  return request.get("/points/delivery/list", { params });
};
export const addShippingDelivery = params => {
  return request.post("/points/delivery/save", params);
};
export const updateShippingDelivery = params => {
  return request.put("/points/delivery/update", params);
};
