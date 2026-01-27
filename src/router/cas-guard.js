import casClient from "@/utils/cas";

export default async function casRouterGuard(to, from, next) {
  console.log("CAS Router Guard - 目标路由:", to.path);

  try {
    // 检查URL中是否有CAS ticket
    const ticket = casClient.getTicketFromUrl();

    if (ticket) {
      console.log("发现CAS ticket，开始验证:", ticket);
      await handleTicketValidation(ticket, to, from, next);
    } else {
      // 没有ticket，检查是否已经通过CAS认证
      await handleNoTicket(to, from, next);
    }
  } catch (error) {
    console.error("CAS认证过程出错:", error);
    // 出错时重新登录
    redirectToCasLogin();
  }
}

// 处理ticket验证
async function handleTicketValidation(ticket, to, from, next) {
  try {
    // 构建service URL（去掉ticket参数）
    const serviceUrl = window.location.origin + to.fullPath.split("?")[0];

    // 验证ticket
    const result = await casClient.validateTicket(ticket, serviceUrl);

    if (result.success) {
      console.log("CAS ticket验证成功，用户:", result.user);

      // 保存CAS用户信息
      casClient.saveUser(result.user);

      // 清除URL中的ticket参数
      casClient.removeTicketFromUrl();

      // 尝试获取系统用户信息
      await loadUserInfo(result.user);
      next();
    } else {
      console.error("CAS ticket验证失败");
      redirectToCasLogin();
    }
  } catch (error) {
    console.error("CAS ticket验证异常:", error);
    redirectToCasLogin();
  }
}

// 处理没有ticket的情况
async function handleNoTicket(to, from, next) {
  // 检查是否有传统的token认证
  const token = localStorage.getItem("token");

  if (token) {
    // 使用传统认证方式
    next();
  } else if (casClient.isAuthenticated()) {
    // 已经通过CAS认证
    console.log("用户已通过CAS认证");

    // 尝试加载用户信息
    const casUser = casClient.getCurrentUser();
    await loadUserInfo(casUser);
    next();
  } else {
    // 需要CAS登录
    console.log("需要CAS登录，重定向到CAS服务器");
    redirectToCasLogin();
  }
}

// 加载用户信息
async function loadUserInfo(casUser) {
  try {
  } catch (error) {
    console.error("加载用户信息失败:", error);
  }
}

// 重定向到CAS登录
function redirectToCasLogin() {
  const serviceUrl = window.location.origin + window.location.pathname;
  const loginUrl = casClient.getLoginUrl(serviceUrl);
  console.log("重定向到CAS登录页:", serviceUrl, loginUrl);
  window.location.href = loginUrl;
}
