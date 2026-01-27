/*
 * @Author: zhangchuntong 1042994420@qq.com
 * @Date: 2025-05-27 18:29:36
 * @LastEditors: zhangchuntong 1042994420@qq.com
 * @LastEditTime: 2025-05-28 09:19:24
 * @FilePath: \vue3-admin\src\utils\request-example.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 使用 AbortController 的示例

import { get, post, requestManager, createCancellableRequest } from './request.js';

// 示例 1: 使用便捷方法发送可取消的请求
export const fetchUserData = () => {
  const { request, cancel, requestId } = get('/api/user');

  // 返回请求 Promise 和取消函数
  return {
    promise: request,
    cancel,
    requestId
  };
};

// 示例 2: 在 Vue 组件中使用
export const useApiRequest = () => {
  let currentRequest = null;

  const fetchData = async (url) => {
    // 如果有进行中的请求，先取消它
    if (currentRequest) {
      currentRequest.cancel();
    }

    // 发送新请求
    const { request, cancel, requestId } = get(url);
    currentRequest = { cancel, requestId };

    try {
      const data = await request;
      currentRequest = null;
      return data;
    } catch (error) {
      currentRequest = null;
      throw error;
    }
  };

  const cancelCurrentRequest = () => {
    if (currentRequest) {
      currentRequest.cancel();
      currentRequest = null;
    }
  };

  return {
    fetchData,
    cancelCurrentRequest
  };
};

// 示例 3: 使用自定义请求 ID
export const fetchWithCustomId = () => {
  const customRequestId = 'my-custom-request-id';

  const { request, cancel } = createCancellableRequest({
    method: 'get',
    url: '/api/data',
    requestId: customRequestId
  });

  return {
    promise: request,
    cancel,
    // 也可以通过请求管理器直接取消
    cancelById: () => requestManager.abortRequest(customRequestId)
  };
};

// 示例 4: 批量取消所有请求
export const cancelAllRequests = () => {
  requestManager.abortAllRequests();
  console.log('所有请求已取消');
};

// 示例 5: 监控待处理请求数量
export const getPendingRequestsCount = () => {
  return requestManager.getPendingRequestsCount();
};
