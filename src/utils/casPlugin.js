// src/plugins/cas.js
import casClient from "../utils/cas.js";

export default {
  install(app) {
    app.config.globalProperties.$cas = {
      // 跳转到 CAS 登录页
      login(service = window.location.href) {
        window.location.href = casClient.getLoginUrl(service);
      },

      // 验证票据
      async validateTicket(ticket, service = window.location.href) {
        try {
          const result = await casClient.validateTicket(ticket, service);
          if (result.success) {
            // 保存用户信息
            casClient.saveUser(result.user);
          }
          return result;
        } catch (error) {
          console.error("CAS 验证失败:", error);
          throw error;
        }
      },

      // 跳转到 CAS 登出页
      logout(service = window.location.origin) {
        // 清除本地用户信息
        casClient.clearUser();
        // 跳转到CAS登出页
        window.location.href = casClient.getLogoutUrl(service);
      },

      // 检查当前 URL 是否有 CAS ticket
      checkTicket() {
        return casClient.getTicketFromUrl();
      },

      // 获取当前用户
      getCurrentUser() {
        return casClient.getCurrentUser();
      },

      // 检查是否已认证
      isAuthenticated() {
        return casClient.isAuthenticated();
      },

      // 清除URL中的ticket参数
      removeTicketFromUrl() {
        casClient.removeTicketFromUrl();
      },

      // 处理CAS认证流程
      async handleAuthentication(to, from, next) {
        try {
          // 检查URL中是否有ticket
          const ticket = this.checkTicket();

          if (ticket) {
            // 验证ticket
            const result = await this.validateTicket(ticket, window.location.origin + to.fullPath.split("?")[0]);

            if (result.success) {
              // 清除URL中的ticket参数
              this.removeTicketFromUrl();
              // 继续导航
              next();
            } else {
              // 验证失败，重新登录
              this.login();
            }
          } else if (this.isAuthenticated()) {
            // 已经认证过，直接放行
            next();
          } else {
            // 需要登录
            this.login();
          }
        } catch (error) {
          console.error("CAS认证处理失败:", error);
          // 认证出错，重新登录
          this.login();
        }
      },
    };

    // 添加全局属性
    app.config.globalProperties.$casClient = casClient;
  },
};
