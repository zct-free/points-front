import request from "@/utils/request.js";

export const deletePointsProduct = params => {
  return request({
    method: "delete",
    url: `/points/product/remove`,
    params: {
      ids: params,
    },
  });
};

export const getPointsProducts = params => {
  return request.get("/points/product/list", { params });
};
export const addPointsProduct = (params) => {
  return request.post("/points/product/save", params);
};

export const updatePointsProduct = params => {
  return request.put("/points/product/update", params);
};

// 积分消耗轨迹
export const getPointsConsumptionLogs = params => {
  return request.get("/points/pointsStream/consumptionTrajectory", { params });
};
// 积分学习报表
export const getPointsLearningReport = params => {
  return request.get("/points/pointsStream/learningReport", { params });
};
