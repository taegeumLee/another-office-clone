import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // params.id가 유효한지 확인
    if (!params.id) {
      return new NextResponse("Invalid product ID", { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: String(params.id),
      },
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

    if (!product) {
      return new NextResponse("상품을 찾을 수 없습니다", { status: 404 });
    }

    // 같은 이름을 가진 다른 제품들 조회 (다른 컬러의 같은 제품)
    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { name: product.name }, // 같은 이름
          { NOT: { id: String(params.id) } }, // 현재 제품 제외
        ],
      },
      include: {
        variants: {
          include: {
            color: true,
            images: {
              where: {
                type: "OUTFIT",
              },
              take: 1,
            },
          },
        },
      },
    });

    // 클라이언트에 맞게 데이터 구조 변환
    const formattedProduct = {
      ...product,
      displayName: `${product.name} (${
        product.variants[0]?.color?.name ?? ""
      })`,
      images: product.variants.flatMap((variant) => variant.images),
      sizes: product.variants.map((variant) => ({
        id: variant.sizeId,
        name: variant.size.name,
        stock: variant.stock,
      })),
      color: product.variants[0]?.color?.name ?? "",
      relatedProducts: relatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        color: p.variants[0]?.color?.name ?? "",
        imageUrl:
          p.variants[0]?.images.find((img) => img.type === "PRODUCT")?.url ||
          p.variants[0]?.images.find((img) => img.type === "OUTFIT")?.url ||
          "/images/default-product.jpg",
      })),
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Product fetch error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
