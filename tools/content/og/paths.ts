import { safePathSegment } from "../shared";

export const ogImageFilename = (slug: string) => `${safePathSegment(slug)}.png`;

export const ogImagePath = (slug: string) => `/og/${ogImageFilename(slug)}`;

export const resolveOgImageUrl = ({
  baseURL,
  cover,
  slug,
}: {
  baseURL: string;
  cover?: string;
  slug?: string;
}) => {
  const coverValue = String(cover ?? "").trim();
  if (coverValue) return new URL(coverValue, baseURL).toString();
  const slugValue = String(slug ?? "").trim();
  if (!slugValue) return "";
  return new URL(ogImagePath(slugValue), baseURL).toString();
};
