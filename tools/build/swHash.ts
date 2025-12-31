const computeSwHash = () => {
  const slice = (v: string) => String(v).trim().slice(0, 12);

  const cfBuildId = process.env.CF_PAGES_BUILD_ID;
  if (cfBuildId) return slice(cfBuildId);
  const cf = process.env.CF_PAGES_COMMIT_SHA;
  if (cf) return cf.slice(0, 12);

  return slice(String(Date.now()));
};

export default computeSwHash;
