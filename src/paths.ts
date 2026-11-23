/** Path inside the app, with the GitHub Pages base removed. */
export function appPath(pathname = window.location.pathname) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  let path = pathname;
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || "/";
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path.startsWith("/") ? path : `/${path}`;
}

/** A link that keeps the GitHub Pages base in production and stays at / in local dev. */
export function appHref(path: string) {
  const suffix = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${suffix}`;
}
