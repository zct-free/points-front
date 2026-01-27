import request from "@/utils/request.js";

export const deletePointsRule = ids => {
  return request({
    method: "delete",
    url: `/points/rule/remove`,
    params: {
      ids: ids,
    },
  });
};

export const getPointsRules = params => {
  return request.get("/points/rule/list", { params });
};
export const addPointsRule = params => {
  return request.post("/points/rule/save", params);
};
export const updatePointsRule = params => {
  return request.put("/points/rule/update", params);
};

export const deletePointsRuleAntiCheat = ids => {
  return request({
    method: "delete",
    url: `/points/blocking/remove`,
    params: {
      ids: ids,
    },
  });
};

export const getPointsRuleAntiCheats = params => {
  return request.get("/points/blocking/list", { params });
};
export const addPointsRuleAntiCheat = params => {
  return request.post("/points/blocking/save", params);
};
export const updatePointsRuleAntiCheat = params => {
  return request.put("/points/blocking/update", params);
};

export const deletePointsRuleTiered = ids => {
  return request({
    method: "delete",
    url: `/points/reward/remove`,
    params: {
      ids: ids,
    },
  });
};

export const getPointsRuleTiereds = params => {
  return request.get("/points/reward/list", { params });
};
export const addPointsRuleTiered = params => {
  return request.post("/points/reward/save", params);
};
export const updatePointsRuleTiered = params => {
  return request.put("/points/reward/update", params);
};
