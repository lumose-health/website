// True where the new look for shared pages (docs, legal, 404) may show: a build
// with the explicit flag, or a PR preview, which CI marks with NEXT_PUBLIC_BUILD_ENV.
export function isV2Preview(): boolean {
  return (
    process.env.NEXT_PUBLIC_DOCS_V2 === "1" ||
    process.env.NEXT_PUBLIC_BUILD_ENV === "preview"
  );
}
