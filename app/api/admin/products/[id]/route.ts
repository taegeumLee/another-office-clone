import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category, Gender } from "@prisma/client";
import { rm, rmdir } from "fs/promises";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            size: true,
            color: true,
            images: {
              orderBy: {
                order: "asc", // 이미지 순서대로 정렬
              },
            },
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("제품을 찾을 수 없습니다.", { status: 404 });
    }

    // API 응답 로깅 추가
    console.log("Product API Response:", JSON.stringify(product, null, 2));

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const data = await request.json();

    // 제품 정보 업데이트
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category as Category,
        subCategory: data.subCategory,
        gender: data.gender as Gender,
      },
    });

    // variants 처리
    if (data.variants && data.variants.length > 0) {
      for (const variant of data.variants) {
        if (variant.id.startsWith("temp-")) {
          // Size 확인/생성
          let size = await prisma.size.findUnique({
            where: { name: variant.size.name },
          });

          if (!size) {
            size = await prisma.size.create({
              data: { name: variant.size.name },
            });
          }

          // Color 확인/생성
          let color = await prisma.color.findFirst({
            where: { code: variant.color.code },
          });

          if (!color) {
            color = await prisma.color.create({
              data: {
                name: variant.color.name,
                code: variant.color.code,
              },
            });
          }

          // 새로운 variant 생성
          await prisma.productVariant.create({
            data: {
              productId: id,
              sizeId: size.id,
              colorId: color.id,
              stock: variant.stock,
            },
          });
        } else {
          // 기존 variant 업데이트
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { stock: variant.stock },
          });
        }
      }
    }

    // 최종 업데이트된 제품 정보 조회
    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            size: true,
            color: true,
            images: true,
          },
        },
      },
    });

    if (!finalProduct) {
      return NextResponse.json(
        { error: "Updated product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: finalProduct });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;

    // 1. 제품의 이미지 정보 조회
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. 이미지 파일 삭제
    const productImagesDir = join(
      process.cwd(),
      "public",
      "images",
      "products",
      id
    );
    try {
      // 디렉토리와 그 안의 모든 파일 삭제
      await rmdir(productImagesDir, { recursive: true });
      console.log(`Deleted image directory: ${productImagesDir}`);
    } catch (error) {
      console.error("Error deleting image directory:", error);
      // 이미지 삭제 실패는 제품 삭제를 중단시키지 않음
    }

    // 3. 제품과 관련된 모든 데이터 삭제 (cascade 설정으로 자동 삭제됨)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product and associated images deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
