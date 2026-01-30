export const to = async fn => {
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
