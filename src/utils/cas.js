// src/utils/cas.js
import axios from "axios";

class CasClient {
  constructor(options = {}) {
    // 根据环境配置不同的CAS服务器地址
    this.baseUrl = this.getCasBaseUrl();
    this.service = options.service || window.location.origin;
    this.ticketParamName = "ticket";
    this.serviceParamName = "service";
  }

  // 根据环境获取CAS服务器地址
  getCasBaseUrl() {
    // 优先使用环境变量配置

    // 回退到默认配置
    switch (process.env.NODE_ENV) {
      case "relasebcos":
        return "http://cas.cop.com/cas/";
      case "k8stest":
        return "http://cas.soap.com/cas/";
      case "k8spre":
        return "https://cas.ced.81.mil.cn/cas/";
      case "k8sproduction":
        return "https://cas.ced.81.mil.cn/cas/";
      default:
        return "http://192.168.100.44:8080/cas/";
    }
  }

  // 获取登录URL
  getLoginUrl(service = this.service) {
    const loginUrl = `${this.baseUrl}login`;
    const params = new URLSearchParams({
      [this.serviceParamName]: service,
    });
    return `${loginUrl}?${params.toString()}`;
  }

  // 获取登出URL
  getLogoutUrl(service = this.service) {
    const logoutUrl = `${this.baseUrl}logout`;
    const params = new URLSearchParams({
      [this.serviceParamName]: service,
    });
    return `${logoutUrl}?${params.toString()}`;
  }

  // 从URL中获取ticket
  getTicketFromUrl(url = window.location.href) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(this.ticketParamName);
  }

  // 验证ticket
  async validateTicket(ticket, service = this.service) {
    try {
      const validateUrl = `${this.baseUrl}serviceValidate`;
      const params = {
        [this.ticketParamName]: ticket,
        [this.serviceParamName]: service,
        format: "json",
      };

      const response = await axios.get(validateUrl, { params });

      if (response.data && response.data.serviceResponse) {
        const { serviceResponse } = response.data;

        if (serviceResponse.authenticationSuccess) {
          return {
            success: true,
            user: serviceResponse.authenticationSuccess.user,
            attributes: serviceResponse.authenticationSuccess.attributes || {},
          };
        }
        if (serviceResponse.authenticationFailure) {
          throw new Error(serviceResponse.authenticationFailure.description || "Authentication failed");
        }
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("CAS ticket validation failed:", error);
      throw error;
    }
  }

  // 清除URL中的ticket参数
  removeTicketFromUrl() {
    const url = new URL(window.location.href);
    if (url.searchParams.has(this.ticketParamName)) {
      url.searchParams.delete(this.ticketParamName);
      window.history.replaceState({}, document.title, url.toString());
    }
  }

  // 检查是否需要CAS认证
  isAuthRequired(route) {
    return route.meta && route.meta.requiresAuth !== false;
  }

  // 获取当前用户信息（从sessionStorage或localStorage）
  getCurrentUser() {
    try {
      const userStr = sessionStorage.getItem("cas_user") || localStorage.getItem("cas_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  // 保存用户信息
  saveUser(user, remember = true) {
    const userStr = JSON.stringify(user);
    if (remember) {
      localStorage.setItem("cas_user", userStr);
    } else {
      sessionStorage.setItem("cas_user", userStr);
    }
  }

  // 清除用户信息
  clearUser() {
    sessionStorage.removeItem("cas_user");
    localStorage.removeItem("cas_user");
  }

  // 检查用户是否已认证
  isAuthenticated() {
    return !!this.getCurrentUser();
  }
}

export default new CasClient();
