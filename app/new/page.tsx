"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Card,
  CardBody,
  CardFooter,
} from "@nextui-org/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";

type SortOption = "newest" | "priceLow" | "priceHigh" | "popular";
type ViewType = "outfit" | "product";
type GridSize = 4 | 6;

interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
  variants: {
    id: string;
    stock: number;
    size: {
      id: string;
      name: string;
    };
    images: {
      id: string;
      url: string;
      type: string;
    }[];
  }[];
}

export default function NewPage() {
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewType, setViewType] = useState<ViewType>("product");
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 이미지 호버 상태를 관리하는 객체
  const [hoveredProducts, setHoveredProducts] = useState<{
    [key: string]: boolean;
  }>({});

  const sortOptions = {
    newest: "신상품",
    priceLow: "낮은 가격",
    priceHigh: "높은 가격",
    popular: "인기상품",
  };

  useEffect(() => {
    fetchProducts();
  }, [sortOption]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        sort: sortOption,
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products);
    } catch (error) {
      console.error("제품 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 정렬된 상품 목록 가져오기
  const getSortedProducts = () => {
    return [...products].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "priceLow":
          return a.price - b.price;
        case "priceHigh":
          return b.price - a.price;
        default:
          return 0;
      }
    });
  };

  // 그리드 클래스 결정 함수
  const getGridClass = () => {
    return gridSize === 4 ? "grid-cols-4" : "grid-cols-6";
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR");
  };

  // 이미지 URL 가져오기
  const getImageUrl = (product: Product, type: "OUTFIT" | "PRODUCT") => {
    const firstVariant = product.variants[0];
    if (!firstVariant) return null;

    const image = firstVariant.images.find((img) => img.type === type);
    return image?.url;
  };

  // 호버 상태 토글 함수
  const handleMouseEnter = useCallback((productId: string) => {
    setHoveredProducts((prev) => ({
      ...prev,
      [productId]: true,
    }));
  }, []);

  const handleMouseLeave = useCallback((productId: string) => {
    setHoveredProducts((prev) => ({
      ...prev,
      [productId]: false,
    }));
  }, []);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4">
        <div className="mx-auto px-4 py-1">
          {/* 필터 바 */}
          <div className="flex justify-between items-center py-2 mb-2">
            <div>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="light"
                    className="capitalize"
                    endContent={<ChevronDownIcon className="w-4 h-4" />}
                  >
                    {sortOptions[sortOption]}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="정렬 옵션"
                  onAction={(key) => setSortOption(key as SortOption)}
                >
                  <DropdownItem key="newest">신상품</DropdownItem>
                  <DropdownItem key="priceLow">낮은 가격</DropdownItem>
                  <DropdownItem key="priceHigh">높은 가격</DropdownItem>
                  <DropdownItem key="popular">인기상품</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <span className="text-sm text-gray-500 mb-6 ml-2">
                총 {products.length}개의 제품
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-800">View Type</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewType === "outfit" ? "flat" : "light"}
                  onClick={() => setViewType("outfit")}
                >
                  아웃핏
                </Button>
                <Button
                  size="sm"
                  variant={viewType === "product" ? "flat" : "light"}
                  onClick={() => setViewType("product")}
                >
                  제품
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={gridSize === 4 ? "flat" : "light"}
                  onClick={() => setGridSize(4)}
                >
                  4
                </Button>
                <Button
                  size="sm"
                  variant={gridSize === 6 ? "flat" : "light"}
                  onClick={() => setGridSize(6)}
                >
                  6
                </Button>
              </div>
            </div>
          </div>

          {/* 상품 그리드 */}
          <div className={`grid ${getGridClass()} gap-4`}>
            {getSortedProducts().map((product) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className="block"
              >
                <Card
                  className="cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(product.id)}
                  onMouseLeave={() => handleMouseLeave(product.id)}
                >
                  <CardBody className="p-0 relative">
                    <Image
                      src={
                        hoveredProducts[product.id]
                          ? getImageUrl(
                              product,
                              viewType === "outfit" ? "PRODUCT" : "OUTFIT"
                            ) || ""
                          : getImageUrl(
                              product,
                              viewType === "outfit" ? "OUTFIT" : "PRODUCT"
                            ) || ""
                      }
                      width={300}
                      height={400}
                      alt={product.name}
                      className="w-full h-full object-cover aspect-[3/4] transition-opacity duration-300"
                    />
                  </CardBody>
                  <CardFooter className="flex flex-col gap-2 px-3 py-2">
                    <div className="flex justify-between items-start w-full">
                      <p className="text-sm">{product.name}</p>
                      <span className="text-sm">
                        KRW {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex gap-1">
                        {[
                          ...new Set(
                            product.variants
                              .filter((v) => v.size && v.size.name)
                              .map((v) => v.size.name)
                          ),
                        ]
                          .sort()
                          .map((sizeName) => {
                            const variant = product.variants.find(
                              (v) => v.size?.name === sizeName
                            );
                            const hasStock =
                              variant?.stock && variant.stock > 0;

                            return (
                              <span
                                key={sizeName}
                                className={`text-xs px-2 py-1 border rounded ${
                                  hasStock
                                    ? "border-gray-800"
                                    : "border-gray-300 text-gray-300 line-through"
                                }`}
                              >
                                {sizeName}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
