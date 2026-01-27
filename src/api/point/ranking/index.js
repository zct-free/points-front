import request from "@/utils/request.js";

//群组积分排行
export const deleteGroupPointsRanking = ids => {
  console.log(ids);
  const idsStr = ids.join(",");
  return request({
    method: "delete",
    url: `/ranking2/${idsStr}`,
  });
};

export const getUserInfoByGroup = params => {
  return request.get("/points/rank/groupRankInfo", { params });
};
export const getGroupPointsRanking = params => {
  return request.get("/points/rank/groupRankInfo", { params });
};
export const addGroupPointsRanking = params => {
  return request.post("/ranking2/add", params);
};
export const updateGroupPointsRanking = params => {
  return request.put("/ranking2/update", params);
};
//个人积分排行
export const deletePointsRanking = ids => {
  console.log(ids);
  const idsStr = ids.join(",");
  return request({
    method: "delete",
    url: `/ranking3/${idsStr}`,
  });
};

export const getPointsRankings = params => {
  return request.get("/points/rank/availablePointsRank", { params });
};
export const addPointsRanking = params => {
  return request.post("/ranking3/add", params);
};
export const updatePointsRanking = params => {
  return request.put("/ranking3/update", params);
};
//个人积分排行
//  deleteUserTotalPoints,
//   getUserTotalPointsList,
//   addUserTotalPoints,
//   updateUserTotalPoints
export const deleteUserTotalPoints = ids => {
  console.log(ids);
  const idsStr = ids.join(",");
  return request({
    method: "delete",
    url: `/points/${idsStr}`,
  });
};

export const getUserTotalPointsList = params => {
  return request.get("/points/rank/userRankInfo", { params });
};
export const addUserTotalPoints = params => {
  return request.post("/points/add", params);
};
export const updateUserTotalPoints = params => {
  return request.put("/points/update", params);
};
// 群主积分详情
export const getGroupMemberRank = params => {
  return request({
    method: "get",
    url: "/points/rank/groupMemberRank",
    params,
  });
};
