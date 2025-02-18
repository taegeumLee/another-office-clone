import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const productId = formData.get("productId") as string;
    const variantId = formData.get("variantId") as string;
    const order = parseInt(formData.get("order") as string);

    if (!file || !type || !productId || !variantId) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 디렉토리 생성
    const uploadDir = join(
      process.cwd(),
      "public",
      "images",
      "products",
      productId
    );
    await mkdir(uploadDir, { recursive: true });

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${type.toLowerCase()}_${Date.now()}_${file.name}`;
    const fullPath = join(uploadDir, fileName);

    await writeFile(fullPath, buffer);

    // DB에 이미지 정보 저장
    const image = await prisma.variantImage.create({
      data: {
        url: `/images/products/${productId}/${fileName}`,
        type: type as "OUTFIT" | "PRODUCT" | "ADDITIONAL",
        order,
        variantId,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error: any) {
    console.error("이미지 업로드 에러:", error);
    return NextResponse.json(
      { error: error.message || "이미지 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
