"use client";

import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { use } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Button,
  Input,
} from "@nextui-org/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

interface Product {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: number;
  discountPrice: number | null;
  material: string;
  sizeInfo: string;
  color: string;
  images: {
    id: number;
    url: string;
  }[];
  sizes: {
    id: number;
    name: string;
    stock: number;
  }[];
  relatedProducts: {
    id: string;
    name: string;
    price: number;
    color: string;
    imageUrl: string;
  }[];
  variants: {
    color: {
      name: string;
    };
  }[];
}

const Accordion = ({ title, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center"
      >
        <span className={`text-sm ${isOpen ? "font-bold" : ""}`}>{title}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
};

export default function ProductDetailPage({ params }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();
  const [existingItem, setExistingItem] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error("상품을 불러올 수 없습니다.");
        const data = await response.json();
        setProduct(data);
        document.title = `${data.name} | ANOTHER OFFICE`;
      } catch (error) {
        console.error("상품 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      document.title = "ANOTHER OFFICE";
    };
  }, [id]);

  const checkExistingItem = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) return false;
      const data = await response.json();
      return data.items.some(
        (item: any) =>
          item.product.id === product!.id && item.size === selectedSize
      );
    } catch (error) {
      console.error("장바구니 확인 실패:", error);
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) return;

    if (!session) {
      router.push("/login");
      return;
    }

    const exists = await checkExistingItem();
    if (exists) {
      setExistingItem(true);
      onConfirmOpen();
      return;
    }

    await addToCart();
  };

  const addToCart = async () => {
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product!.id,
          size: selectedSize,
          color: product!.variants[0]?.color?.name || "",
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "장바구니 추가 실패");
      }

      onSuccessOpen();
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      alert("장바구니에 추가하는 중 오류가 발생했습니다.");
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (num > 0 && num <= 10) {
      setQuantity(num);
    }
  };

  if (!mounted || loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 relative">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex gap-8 h-[calc(100vh-120px)]">
            {/* 왼쪽 이미지 섹션 (2/3) */}
            <div className="w-2/3 overflow-y-auto pr-4 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      width={600}
                      height={800}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 오른쪽 정보 섹션 (1/3) */}
            <div className="w-1/3 overflow-y-auto h-full pr-4 scrollbar-hide">
              <div className="space-y-8 mt-12">
                <div className="space-y-4">
                  <h1 className="text-lg font-semibold mb-2">
                    {product.displayName}
                  </h1>
                  <div className="space-y-4">
                    <div className="flex gap-1 items-center">
                      {product.discountPrice && (
                        <span className="text-default-400 line-through text-sm">
                          {product.price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-sm text-default-600">
                        KRW{" "}
                        {(
                          product.discountPrice || product.price
                        ).toLocaleString()}
                      </span>
                    </div>

                    {/* 다른 컬러 섹션 */}
                    {product.relatedProducts.length > 0 && (
                      <div className="pt-4">
                        <div className="flex flex-wrap gap-2">
                          {product.relatedProducts.map((related) => (
                            <Link
                              key={related.id}
                              href={`/products/${related.id}`}
                              className="group relative"
                            >
                              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                <Image
                                  src={related.imageUrl}
                                  alt={`${related.name} - ${related.color}`}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  priority
                                />
                              </div>
                              {/* 호버 시 나타나는 컬러명 */}
                              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                {related.color}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">size</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => {
                        const isOutOfStock = size.stock === 0;
                        return (
                          <button
                            key={size.id}
                            onClick={() =>
                              !isOutOfStock && setSelectedSize(size.name)
                            }
                            disabled={isOutOfStock}
                            className={`px-3 py-2 rounded-lg border text-sm transition-colors
                              ${
                                selectedSize === size.name
                                  ? "border-black bg-black text-white"
                                  : isOutOfStock
                                  ? "border-gray-200 text-gray-300 line-through cursor-not-allowed"
                                  : "border-gray-300 hover:border-gray-400"
                              }
                            `}
                          >
                            {size.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 py-3 rounded border border-black transition-all ${
                          selectedSize
                            ? "bg-black text-white hover:bg-white hover:text-black"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200"
                        }`}
                        disabled={!selectedSize}
                      >
                        {selectedSize ? "구매하기" : "사이즈를 선택하세요"}
                      </button>
                      <button
                        onClick={handleAddToCart}
                        disabled={!selectedSize}
                        className="px-4 py-3 border rounded text-xs hover:border-black transition-colors"
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button className="text-sm text-gray-600 hover:text-black transition-colors">
                        문의하기
                      </button>
                    </div>
                  </div>

                  {/* 제품 상세 정보 아코디언 */}
                  <div className="space-y-0">
                    <Accordion title="제품 설명">
                      <div className="text-sm text-gray-600 leading-relaxed space-y-6">
                        <div>
                          <pre className="whitespace-pre-wrap">
                            {product.description}
                          </pre>
                        </div>
                      </div>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 이미 장바구니에 있는 경우 확인 모달 */}
        <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
          <ModalContent>
            <ModalBody className="py-6">
              <p className="text-center mb-4">
                이미 장바구니에 담긴 상품입니다.
                <br />
                그래도 추가하시겠습니까?
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  color="primary"
                  className="bg-black"
                  onClick={() => {
                    onConfirmClose();
                    addToCart();
                  }}
                >
                  확인
                </Button>
                <Button variant="light" onClick={onConfirmClose}>
                  취소
                </Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* 장바구니 추가 성공 모달 */}
        <Modal isOpen={isSuccessOpen} onClose={onSuccessClose}>
          <ModalContent>
            <ModalBody>
              <h2>장바구니에 추가되었습니다.</h2>
              <div className="flex gap-4">
                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={product.images.find((img) => img.url)?.url || ""}
                    alt={product.name}
                    width={96}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Size: {selectedSize}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">수량:</p>
                      <Input
                        type="number"
                        value={quantity.toString()}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        min={1}
                        max={10}
                        className="w-20"
                        size="sm"
                      />
                    </div>
                    <p className="text-sm font-medium">
                      KRW{" "}
                      {(
                        product.discountPrice || product.price
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button
                  color="primary"
                  className="w-full bg-black text-white"
                  onClick={() => {
                    onSuccessClose();
                    router.push("/cart");
                  }}
                >
                  장바구니로 이동
                </Button>
                <Button
                  className="w-full"
                  variant="light"
                  onClick={onSuccessClose}
                >
                  쇼핑 계속하기
                </Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </main>
      <Footer />
    </div>
  );
}
