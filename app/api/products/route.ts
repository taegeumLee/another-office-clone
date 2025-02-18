import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "newest";

    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: sort === "newest" ? "desc" : undefined,
        price:
          sort === "priceLow"
            ? "asc"
            : sort === "priceHigh"
            ? "desc"
            : undefined,
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("제품 조회 에러:", error);
    return NextResponse.json(
      { error: "제품 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
