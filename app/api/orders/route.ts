import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderItems, shippingInfo } = await req.json();

    // 트랜잭션으로 주문 처리
    const order = await prisma.$transaction(async (tx) => {
      // 1. 재고 확인 및 업데이트
      for (const item of orderItems) {
        const variant = await tx.productVariant.findFirst({
          where: {
            productId: item.product.id,
            size: { name: item.size },
          },
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`재고 부족: ${item.product.name} - ${item.size}`);
        }

        // 재고 감소
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: variant.stock - item.quantity },
        });
      }

      // 2. 주문 생성
      const newOrder = await tx.order.create({
        data: {
          user: { connect: { email: session.user.email } },
          items: {
            create: orderItems.map((item: any) => ({
              productId: item.product.id,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              price: item.product.price,
            })),
          },
          totalAmount: orderItems.reduce(
            (sum: number, item: any) =>
              sum + item.product.price * item.quantity,
            0
          ),
          name: shippingInfo.name,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          detailAddress: shippingInfo.detailAddress,
          shippingAddress: `${shippingInfo.address} ${shippingInfo.detailAddress}`,
          status: "PAID",
        },
      });

      // 3. 장바구니에서 주문한 상품 제거
      await tx.cartItem.deleteMany({
        where: {
          id: { in: orderItems.map((item: any) => item.id) },
        },
      });

      return newOrder;
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
