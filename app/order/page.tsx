"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Input, Button } from "@nextui-org/react";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  size: string;
  color: string;
}

interface UserInfo {
  name: string;
  phone: string;
  address: string;
  detailAddress: string;
}

export default function OrderPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    phone: "",
    address: "",
    detailAddress: "",
  });

  useEffect(() => {
    const items = searchParams.get("items");
    if (items) {
      setOrderItems(JSON.parse(items));
    }

    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
      }
    };

    if (session) {
      fetchUserInfo();
    }
  }, [searchParams, session]);

  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const handlePayment = async () => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderItems,
          shippingInfo: userInfo,
        }),
      });

      if (!response.ok) {
        throw new Error("결제 처리 중 오류가 발생했습니다.");
      }

      const { orderId } = await response.json();
      router.push(`/order/complete?orderId=${orderId}`);
    } catch (error) {
      console.error("결제 실패:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">주문/결제</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* 주문 상품 목록 */}
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">주문 상품</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <div className="text-sm text-gray-600">
                        <p>Size: {item.size}</p>
                        <p>Color: {item.color}</p>
                        <p>수량: {item.quantity}개</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        KRW{" "}
                        {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 배송 정보 */}
            <div className="border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-bold">배송 정보</h2>
              <div className="space-y-4">
                <Input
                  label="이름"
                  value={userInfo.name}
                  onChange={(e) =>
                    setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  label="전화번호"
                  value={userInfo.phone}
                  onChange={(e) =>
                    setUserInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
                <Input
                  label="주소"
                  value={userInfo.address}
                  onChange={(e) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
                <Input
                  label="상세주소"
                  value={userInfo.detailAddress}
                  onChange={(e) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      detailAddress: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-bold">결제 정보</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>KRW {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>무료</span>
                </div>
                <div className="border-t pt-3 font-bold flex justify-between">
                  <span>총 결제금액</span>
                  <span>KRW {calculateTotal().toLocaleString()}</span>
                </div>
              </div>
              <Button
                color="primary"
                className="w-full bg-black"
                size="lg"
                onClick={handlePayment}
              >
                결제하기
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
