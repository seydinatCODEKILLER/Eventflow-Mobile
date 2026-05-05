import { prepareMultipartData } from "./form-data";

/**
 * Construit le body d'une requête API :
 * - JSON si aucune image n'est présente
 * - multipart/form-data si une image URI est présente
 *
 * @example — Avatar
 * buildApiBody({ fullName: "Fatou", avatarUri: "file://..." }, {
 *   imageUriKey: "avatarUri",
 *   imageFieldName: "avatar",
 * })
 *
 * @example — Event sans image
 * buildApiBody({ title: "Concert", capacity: 500 }, {
 *   imageUriKey: "imageUri",
 *   imageFieldName: "image",
 * })
 * // → { body: { title, capacity }, isMultipart: false }
 */
export const buildApiBody = (
  payload: Record<string, any>,
  imageUriKey: string,
  imageFieldName: string,
): { body: FormData | Record<string, any>; isMultipart: boolean } => {
  const { [imageUriKey]: imageUri, ...rest } = payload;

  // Sans image → JSON simple
  if (!imageUri) {
    return { body: rest, isMultipart: false };
  }

  // Avec image → FormData
  const data = { ...rest, [imageFieldName]: imageUri };

  return {
    body: prepareMultipartData(data, [imageFieldName]),
    isMultipart: true,
  };
};