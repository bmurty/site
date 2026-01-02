import { create } from "deno-exif/mod.ts";

export function GetExifDataFromPhoto(
  photoDirectory: string,
  photoFile: string,
): Record<string, string | number> {
  // Get the EXIF data from the image
  const parser = create(Deno.readFileSync(photoDirectory + "/" + photoFile));
  const result = parser.parse();

  // Format the data in to human-friendly content assuming photos may not have values for these properties
  const photoDevice: string = result.tags.Make && result.tags.Model ? result.tags?.Make + " " + result.tags?.Model : "";
  const photoAperture: string = result.tags.ApertureValue ? result.tags.ApertureValue : "";
  const photoMegapixel: number = Math.floor(
    (result.imageSize.width * result.imageSize.height) / 1000000,
  );

  return {
    photo_device: photoDevice,
    photo_width: result.imageSize.width,
    photo_height: result.imageSize.height,
    photo_aperture: photoAperture,
    photo_megapixel: photoMegapixel,
    photo_iso: result.tags.ISO,
    photo_focallength: result.tags.FocalLength,
  };
}
