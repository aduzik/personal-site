export function isListPage(pageParam: string[] | undefined): boolean {
  if (typeof pageParam === "undefined" || pageParam.length !== 1) return true;

  const currentPage = parseInt(pageParam[0]);
  return !isNaN(currentPage) && currentPage >= 2;
}

export function getPageNumber(pageParam: string[] | undefined): number | null {
  if (typeof pageParam === "undefined" || pageParam.length !== 1) return null;

  const currentPage = parseInt(pageParam[0]);
  return isNaN(currentPage) ? null : currentPage;
}

export function getArticleSlug(pageParam: string[] | undefined): string | null {
  if (typeof pageParam === "undefined" || pageParam.length !== 1) return null;

  const slug = pageParam[0];
  return isNaN(parseInt(slug)) ? slug : null;
}
