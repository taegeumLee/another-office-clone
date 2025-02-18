import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const productId = formData.get("productId") as string;

    if (!file || !type || !productId) {
      return Response.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 디렉토리 생성
    const productDir = path.join(
      process.cwd(),
      "public",
      "images",
      "product",
      productId
    );
    const typeDir = path.join(productDir, type.toLowerCase());
    await mkdir(typeDir, { recursive: true });

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}_${file.name}`;
    const filepath = path.join(typeDir, filename);
    await writeFile(filepath, buffer);

    // DB에 저장할 상대 경로
    const relativePath = `/images/product/${productId}/${type.toLowerCase()}/${filename}`;

    return Response.json({ url: relativePath });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "파일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
