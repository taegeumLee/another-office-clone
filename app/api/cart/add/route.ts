import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, size, color, quantity } = await req.json();

    // 사용자의 장바구니 찾기 또는 생성
    let cart = await prisma.cart.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          user: { connect: { email: session.user.email } },
        },
      });
    }

    // 장바구니에 상품 추가
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        size,
        color,
      },
    });

    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
