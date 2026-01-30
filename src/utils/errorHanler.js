export const errHandler = app => {
  app.config.errorHandler = (err, vm, info) => {
    console.error("Global Error Handler:", err, vm, info);
  };
};
