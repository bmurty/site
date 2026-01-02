import { Image } from "imagescript/mod.ts";

export async function GeneratePhotoThumbail(
  photoDirectory: string,
  photoFile: string,
): Promise<string> {
  const thumbnailDirectory = "assets/images/brendan/thumbnails";

  const photoBinary = Deno.readFileSync(photoDirectory + "/" + photoFile);
  const photoDecoded = await Image.decode(photoBinary);

  photoDecoded.resize(500, Image.RESIZE_AUTO);

  const thumbnailImageEncoded = await photoDecoded.encode();

  const thumbnailImagePath = thumbnailDirectory + "/500_" +
    photoFile.slice(0, -4).replaceAll(".", "") + ".png";

  Deno.writeFileSync(thumbnailImagePath, thumbnailImageEncoded);

  return thumbnailImagePath.replace("assets/", "/");
}
