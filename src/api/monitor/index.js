import request from "@/utils/request.js";

export const getSecurityAlertLogs = params => {
  return request.get("/points/pointsMonitor/list", { params });
};

export const updatePointsConsumptionLog = params => {
  return request.put("/points/pointsMonitor/update", params);
};
// 加入黑名单
export const addToBlacklist = id => {
  return request({
    method: "post",
    url: "/points/pointsMonitor/add_to_black?id=" + id,
  });
};
// 标记为正常
export const markAsNormal = id => {
  return request({
    method: "put",
    url: "/points/pointsMonitor/markNormal?id=" + id,
  });
};
