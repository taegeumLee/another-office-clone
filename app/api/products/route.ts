import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";

    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            size: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products fetch error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
