"use client";

import { useState, useEffect } from "react";
import { Button, Input, Checkbox } from "@nextui-org/react";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: {
      id: string;
      url: string;
      type: string;
    }[];
  };
  quantity: number;
  size: string;
  color: string;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "authenticated") {
      fetchCartItems();
    }
  }, [mounted, status]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("장바구니를 불러올 수 없습니다.");
      const data = await response.json();
      setCartItems(data.items);
    } catch (error) {
      console.error("장바구니 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("수량 변경에 실패했습니다.");

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("수량 변경 실패:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm("이 상품을 장바구니에서 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("상품 삭제에 실패했습니다.");

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("상품 삭제 실패:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const calculateSelectedTotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleOrder = () => {
    if (selectedItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }

    const orderItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    router.push(
      `/order?items=${encodeURIComponent(JSON.stringify(orderItems))}`
    );
  };

  if (!mounted) {
    return null;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen" suppressHydrationWarning>
      <Header />
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">장바구니</h1>
        <Checkbox
          isSelected={selectedItems.length === cartItems.length}
          onValueChange={handleSelectAll}
          classNames={{
            base: "mb-6",
            wrapper:
              "before:border-gray-300 group-data-[selected=true]:before:border-black group-data-[selected=true]:before:bg-black",
          }}
        >
          <span className="text-sm">전체 선택</span>
        </Checkbox>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">장바구니가 비어있습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-6 p-6 border rounded-lg">
                  <Checkbox
                    isSelected={selectedItems.includes(item.id)}
                    onValueChange={(checked) =>
                      handleSelectItem(item.id, checked)
                    }
                    classNames={{
                      wrapper:
                        "before:border-gray-300 group-data-[selected=true]:before:border-black group-data-[selected=true]:before:bg-black",
                    }}
                  />
                  <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.images[0]?.url || ""}
                      alt={item.product.name}
                      width={128}
                      height={160}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                          {item.product.name}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Size: {item.size}</p>
                          <p>Color: {item.color}</p>
                        </div>
                      </div>
                      <p className="text-lg font-medium">
                        KRW{" "}
                        {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={item.quantity.toString()}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            parseInt(e.target.value)
                          )
                        }
                        min={1}
                        max={10}
                        className="w-24"
                        size="sm"
                      />
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8 p-8 border rounded-lg space-y-6 min-h-[320px]">
                <h2 className="text-2xl font-bold">주문 요약</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-lg h-7">
                    <span>상품 금액</span>
                    <span className="w-32 text-right">
                      KRW {calculateSelectedTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg h-7">
                    <span>배송비</span>
                    <span className="w-32 text-right">무료</span>
                  </div>
                  <div className="border-t pt-4 font-bold flex justify-between text-xl h-10">
                    <span>총 결제금액</span>
                    <span className="w-32 text-right">
                      KRW {calculateSelectedTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  color="primary"
                  className="w-full bg-black text-lg h-14"
                  size="lg"
                  onClick={handleOrder}
                  isDisabled={selectedItems.length === 0}
                >
                  {selectedItems.length === 0
                    ? "상품을 선택하세요"
                    : "주문하기"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
