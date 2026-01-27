<template>
  <div class="dashboard-container">
    <!-- Top Section - Stats Cards -->
    <div class="top-section">
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-title">今日新增用户</div>
          <div class="stat-value">
            1,286 <span class="stat-change">·12.5%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-title">累计用户总数</div>
          <div class="stat-value">
            156,420 <span class="stat-change">·8.3%</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-title">当前积分总量</div>
          <div class="stat-value">
            5,890,320 <span class="stat-status">正常</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-title">本月规则变动</div>
          <div class="stat-value">3 <span class="stat-status">正常</span></div>
          <div class="stat-date">2025-08-02</div>
        </div>
      </div>
    </div>

    <!-- Middle Section - Button Menu -->
    <div class="middle-section">
      <div class="button-menu">
        <!-- 第一行按钮 -->
        <div class="button-row">
          <button class="menu-button active">账户管理</button>
          <button class="menu-button">排行查询</button>
          <button class="menu-button">规则编辑</button>
        </div>
        <!-- 第二行按钮 -->
        <div class="button-row">
          <button class="menu-button">消耗审核</button>
          <button class="menu-button">安全设置</button>
          <button class="menu-button">系统设置</button>
        </div>
      </div>
    </div>

    <!-- Bottom Section - Content Area -->
    <div class="bottom-section">
      <div class="content-grid">
        <!-- Left Column -->
        <div class="content-left">
          <div class="section-title">积分变动记录</div>
          <div class="table-wrapper">
          <table class="points-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>用户ID</th>
                <th>变动类型</th>
                <th>积分数量</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025-08-06 11:45:12</td>
                <td>U33445566</td>
                <td>购买会员</td>
                <td>-300</td>
                <td><span class="status-normal">正常</span></td>
              </tr>
              <tr>
                <td>2025-08-06 10:30:18</td>
                <td>U77889900</td>
                <td>分享文章</td>
                <td>+20</td>
                <td><span class="status-normal">正常</span></td>
              </tr>
              <tr>
                <td>2025-08-06 09:55:42</td>
                <td>U11223344</td>
                <td>违规扣除</td>
                <td>-100</td>
                <td><span class="status-normal">正常</span></td>
              </tr>
              <tr>
                <td>2025-08-06 09:10:05</td>
                <td>U55667788</td>
                <td>活动奖励</td>
                <td>+150</td>
                <td><span class="status-normal">正常</span></td>
              </tr>
              <tr>
                <td>2025-08-06 08:30:27</td>
                <td>U99001122</td>
                <td>商品退款</td>
                <td>+180</td>
                <td><span class="status-normal">正常</span></td>
              </tr>
              <tr>
                <td>2025-08-06 08:15:39</td>
                <td>U33445577</td>
                <td>系统补偿</td>
                <td>+50</td>
                <td><span class="status-normal">正常</span></td>
              </tr>
              <tr>
                <td>2025-08-06 07:45:51</td>
                <td>U88990011</td>
                <td>兑换实物</td>
                <td>-500</td>
                <td><span class="status-pending">审核中</span></td>
              </tr>
              <tr>
                <td>2025-08-06 07:20:33</td>
                <td>U22334455</td>
                <td>观看视频</td>
                <td>+5</td>
                <td><span class="status-normal">正常</span></td>
              </tr>
              <tr>
                <td>2025-08-06 06:50:44</td>
                <td>U66778899</td>
                <td>评论奖励</td>
                <td>+10</td>
                <td><span class="status-normal">正常</span></td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <!-- Right Column -->
        <div class="content-right">
          <div class="right-section">
            <div class="section-title">安全预警</div>
            <div class="alerts-list">
              <div class="alert-item">
                2025-08-05 14:20 用户U12345678在100分钟内操作15次
              </div>
              <div class="alert-item">
                2025-08-04 17:50 积分发放任务延迟，请检查服务
              </div>
              <div class="alert-item">
                2025-08-04 09:35 数据连续不锁定，建议处理
              </div>
            </div>
          </div>

          <div class="right-section">
            <div class="section-title">规则公告</div>
            <div class="notices-list">
              <div class="notice-item">
                <div class="notice-date">2025-07-20</div>
                <div class="notice-content">
                  【重要通知】积分将数据延长至12个月（2025-07-01生效）
                </div>
              </div>
              <div class="notice-item">
                <div class="notice-date">2025-06-15</div>
                <div class="notice-content">
                  【新增功能】积分兑换优惠券功能上线
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewsUserDashboard",
  data() {
    return {
      // Data could be populated from API calls in a real application
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  font-family: Arial, sans-serif;
  color: #333;
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

/* Top Section Styles */
.top-section {
  margin-bottom: 20px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 16px;
  color: #28a745;
  font-weight: normal;
}

.stat-status {
  font-size: 16px;
  color: #28a745;
  font-weight: normal;
}

.stat-date {
  font-size: 14px;
  color: #999;
}

/* Middle Section Styles */
.middle-section {
  margin-bottom: 20px;
}

.button-menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.button-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.menu-button {
  padding: 20px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-button:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.menu-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  font-weight: bold;
}

/* Bottom Section Styles */
.bottom-section {
  flex: 1;
  min-height: 0; /* 允许内容区域收缩 */
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  height: 100%;
}

.content-left {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 关键：允许内容区域收缩 */
}
.table-wrapper {
  flex: 1;
  overflow: auto;
  margin-top: 15px;
  display: flex;
  flex-direction: column;
}
.content-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.right-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.points-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.points-table thead {
  display: block;
}
.points-table tbody {
  flex: 1;
  display: block;
  overflow-y: auto;
}
.points-table tr {
  display: flex;
}
.points-table th,
.points-table td {
  padding: 15px 20px;
  flex: 1;
  min-width: 0; /* 允许内容收缩 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-bottom: 1px solid #ddd;
}
/* .points-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  font-size: 16px;
  position: sticky;
  top: 0;
} */
/* 设置各列比例 */
.points-table th:nth-child(1),
.points-table td:nth-child(1) {
  flex: 3; /* 时间列最宽 */
}

.points-table th:nth-child(2),
.points-table td:nth-child(2) {
  flex: 1; /* 用户ID列 */
}

.points-table th:nth-child(3),
.points-table td:nth-child(3) {
  flex: 2; /* 变动类型列 */
}

.points-table th:nth-child(4),
.points-table td:nth-child(4) {
  flex: 1; /* 积分数量列 */
}

.points-table th:nth-child(5),
.points-table td:nth-child(5) {
  flex: 1; /* 状态列 */
}

.points-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  position: sticky;
  top: 0;
}
.status-normal {
  color: #28a745;
  font-weight: bold;
}

.status-pending {
  color: #ffc107;
  font-weight: bold;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  overflow: auto;
}

.alert-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  font-size: 16px;
}

.alert-item:last-child {
  border-bottom: none;
}

.notices-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  overflow: auto;
}

.notice-item {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.notice-date {
  width: 120px;
  font-size: 16px;
  color: #666;
}

.notice-content {
  flex: 1;
  font-size: 16px;
}
</style>