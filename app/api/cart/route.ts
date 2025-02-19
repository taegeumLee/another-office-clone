import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const formattedItems = cart.items.map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        images: item.product.variants[0]?.images || [],
      },
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
