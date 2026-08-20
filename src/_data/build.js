module.exports = () => {
  const now = new Date();
  return { year: now.getFullYear(), iso: now.toISOString().slice(0, 10) };
};
