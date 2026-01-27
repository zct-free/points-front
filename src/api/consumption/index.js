import request from "@/utils/request.js";

export const getPointsConsumptionLogs = params => {
  return request.get("/points/consume/leave", { params });
};
