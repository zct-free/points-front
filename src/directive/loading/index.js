// 封装v-loading指令

// 创建加载遮罩层
function createLoadingMask(options = {}) {
  const { text = "加载中...", background = "rgba(255, 255, 255, 0.9)", spinner = "dots", customClass = "" } = options;

  // 创建遮罩层
  const mask = document.createElement("div");
  mask.className = `v-loading-mask ${customClass}`;
  mask.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${background};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 9999;
    transition: all 0.3s;
  `;

  // 创建加载动画
  const spinnerEl = document.createElement("div");
  spinnerEl.className = `v-loading-spinner v-loading-spinner-${spinner}`;

  if (spinner === "default") {
    spinnerEl.style.cssText = `
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #409eff;
      border-radius: 50%;
      animation: v-loading-spin 1s linear infinite;
      margin-bottom: 16px;
    `;
  } else if (spinner === "dots") {
    spinnerEl.innerHTML = `
      <div class="v-loading-dot"></div>
      <div class="v-loading-dot"></div>
      <div class="v-loading-dot"></div>
    `;
    spinnerEl.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    `;
  }

  // 创建加载文本
  const textEl = document.createElement("div");
  textEl.className = "v-loading-text";
  textEl.textContent = text;
  textEl.style.cssText = `
    color: #606266;
    font-size: 14px;
    user-select: none;
  `;

  mask.appendChild(spinnerEl);
  mask.appendChild(textEl);

  return {
    mask,
    spinner: spinnerEl,
    text: textEl,
  };
}

// 添加样式到文档头部
function addLoadingStyles() {
  if (document.getElementById("v-loading-styles")) return;

  const style = document.createElement("style");
  style.id = "v-loading-styles";
  style.textContent = `
    @keyframes v-loading-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes v-loading-dot-bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }

    .v-loading-dot {
      width: 8px;
      height: 8px;
      background-color: #409eff;
      border-radius: 50%;
      animation: v-loading-dot-bounce 1.4s infinite ease-in-out both;
    }

    .v-loading-dot:nth-child(1) { animation-delay: -0.32s; }
    .v-loading-dot:nth-child(2) { animation-delay: -0.16s; }
    .v-loading-dot:nth-child(3) { animation-delay: 0s; }

    .v-loading-mask {
      user-select: none;
      pointer-events: auto;
    }

    .v-loading-fade-enter-active, .v-loading-fade-leave-active {
      transition: opacity 0.3s;
    }

    .v-loading-fade-enter-from, .v-loading-fade-leave-to {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
}

// 显示加载状态
function showLoading(el, binding) {
  if (el.loadingInstance) return;

  // 确保元素具有相对定位
  const originalPosition = getComputedStyle(el).position;
  if (originalPosition === "static") {
    el.style.position = "relative";
  }

  // 解析指令参数
  let options = {};
  if (typeof binding.value === "object" && binding.value !== null) {
    options = binding.value;
  } else if (typeof binding.value === "string") {
    options = { text: binding.value };
  }

  // 从修饰符获取选项
  if (binding.modifiers.dots) {
    options.spinner = "dots";
  }
  if (binding.modifiers.fullscreen) {
    options.customClass = "v-loading-fullscreen";
  }

  // 创建加载实例
  const instance = createLoadingMask(options);
  el.loadingInstance = instance;

  // 添加到元素
  el.appendChild(instance.mask);

  // 如果是全屏模式
  if (binding.modifiers.fullscreen) {
    instance.mask.style.position = "fixed";
    instance.mask.style.zIndex = "99999";
    document.body.appendChild(instance.mask);
  }
}

// 隐藏加载状态
function hideLoading(el) {
  if (!el.loadingInstance) return;

  const { mask } = el.loadingInstance;

  // 添加淡出动画
  mask.style.opacity = "0";

  setTimeout(() => {
    if (mask.parentNode) {
      mask.parentNode.removeChild(mask);
    }
    el.loadingInstance = undefined;
  }, 300);
}

// v-loading 指令定义
export const vLoading = {
  mounted(el, binding) {
    addLoadingStyles();

    if (binding.value) {
      showLoading(el, binding);
    }
  },

  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      if (binding.value) {
        showLoading(el, binding);
      } else {
        hideLoading(el);
      }
    }
  },

  unmounted(el) {
    hideLoading(el);
  },
};

// 默认导出所有指令
export default {
  loading: vLoading,
};
