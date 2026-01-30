export default {
  install(app) {
    app.config.globalProperties.$to = async fn => {
      if (typeof fn !== "function") {
        throw new TypeError("Expected a function");
      }
      try {
        const result = await fn;
        return [null, result];
      } catch (error) {
        return [error, null];
      }
    };
    app.config.globalProperties.$copy = text => {
      if (!text) {
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Text copied to clipboard");
        })
        .catch(err => {
          console.error("Could not copy text: ", err);
        });
    };
  },
};
