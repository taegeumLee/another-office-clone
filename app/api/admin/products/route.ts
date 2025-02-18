import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category, Gender } from "@prisma/client";
export async function POST(req: Request) {
  const data = await req.json();
  const {
    name,
    description,
    price,
    category,
    subCategory,
    gender,
    variants,
    colors,
  } = data;

  // 1. 제품 기본 정보 생성
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      category,
      subCategory,
      gender,
    },
  });

  // 2. 각 variant에 대해 Size와 Color 처리
  const createdVariants = [];
  for (const variant of variants) {
    // Size 확인/생성
    let size = await prisma.size.findUnique({
      where: { name: variant.sizeId },
    });

    if (!size) {
      size = await prisma.size.create({
        data: { name: variant.sizeId },
      });
    }

    // Color 확인/생성
    let color = await prisma.color.findFirst({
      where: { code: variant.colorId },
    });

    if (!color) {
      const colorName = colors.find(
        (c: { code: string; name: string }) => c.code === variant.colorId
      )?.name;

      color = await prisma.color.create({
        data: {
          name: colorName || variant.colorId,
          code: variant.colorId,
        },
      });
    }

    // ProductVariant 생성
    const createdVariant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sizeId: size.id,
        colorId: color.id,
        stock: variant.stock,
      },
    });

    createdVariants.push(createdVariant);
  }

  return NextResponse.json({
    success: true,
    product: {
      id: product.id,
      variants: createdVariants,
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category") as Category | null;
    const gender = searchParams.get("gender") as Gender | null;
    const size = searchParams.get("size");
    const stock = searchParams.get("stock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: {
          contains: search,
        },
      }),
      ...(category && { category: category as Category }),
      ...(gender && { gender: gender as Gender }),
      ...(size && {
        variants: {
          some: {
            size: {
              name: size,
            },
          },
        },
      }),
      ...(stock && {
        variants: {
          some: {
            stock: stock === "in-stock" ? { gt: 0 } : { equals: 0 },
          },
        },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            include: {
              size: true,
              color: true,
              images: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("제품 조회 에러:", error);
    return NextResponse.json(
      { error: error.message || "제품 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
