const merge = (value, state = {}) =>
  Object.entries(state).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: typeof v === 'object' ? { ...acc[k], ...merge(acc[k], v) } : v
    }),
    value
  );
export default merge;
