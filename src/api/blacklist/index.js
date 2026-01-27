import request from "@/utils/request.js";

export const deleteBlacklist = ids => {
  return request({
    method: "delete",
    url: `/points/pointsBlack/remove`,
    params: { ids },
  });
};

export const getBlacklists = params => {
  return request.get("/points/pointsBlack/list", { params });
};
export const addBlacklist = params => {
  return request.post("/points/pointsBlack/add", params);
};
export const updateBlacklist = params => {
  return request.put("/points/pointsBlack/update", params);
};
