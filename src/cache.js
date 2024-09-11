const cache = {};

const cacheResponse = (key, value) => {
  cache[key] = value;
};

const getCachedResponse = (key) => {
  return cache[key];
};

module.exports = {
  cacheResponse,
  getCachedResponse,
};
