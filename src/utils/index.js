export const to = async fn => {
  if (typeof fn !== "function") {
    throw new TypeError("Expected a function");
  }
  try {
    const result = await fn;
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};
