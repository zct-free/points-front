import request from "@/utils/request.js";
//个人积分排行
export const deleteFriend = ids => {
  console.log(ids);
  const idsStr = ids.join(",");
  return request({
    method: "delete",
    url: `/ranking3/${idsStr}`,
  });
};

export const getFriendsList = params => {
  return request.get("/points/rank/friendRankInfo", { params });
};
export const addFriend = params => {
  return request.post("/points/add", params);
};
export const updateFriend = params => {
  return request.put("/points/update", params);
};
// 好友排行
export const getFriendsRank = params => {
  return request({
    method: "get",
    url: "/points/rank/friendRank",
    params,
  });
};
// 好友积分统计
export const getFriendsPointsStats = params => {
  return request({
    method: "get",
    url: "/points/rank/friendRankStatistics",
    params,
  });
}
