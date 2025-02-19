"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Button } from "@nextui-org/react";

export default function OrderCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold">주문이 완료되었습니다</h1>
          <p className="text-gray-600">주문번호: {orderId}</p>
          <div className="space-y-4">
            <Button
              color="primary"
              className="bg-black"
              size="lg"
              onClick={() => router.push("/")}
            >
              쇼핑 계속하기
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
