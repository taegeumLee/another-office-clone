"use client";

import { useState, useCallback } from "react";
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
  id: number;
  name: string;
  outfitImageUrl: string;
  productImageUrl: string;
  price: number;
  createdAt: Date;
  discount: number;
}

// 더미 데이터 생성
const generateDummyProducts = (count: number): Product[] => {
  return Array(count)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      name: `Legacy Single Wool Blazer (Black)`,
      outfitImageUrl: `/images/product/${index + 1}/outfit.jpg`,
      productImageUrl: `/images/product/${index + 1}/product.jpg`,
      price: Math.floor(Math.random() * 150000) + 50000, // 50000~200000 사이 랜덤 가격
      createdAt: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000), // 최근 30일 내의 랜덤 날짜
      discount: Math.floor(Math.random() * 10) + 1, // 1~10 사이 랜덤 할인율
    }));
};

export default function NewPage() {
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewType, setViewType] = useState<ViewType>("product");
  const [gridSize, setGridSize] = useState<GridSize>(4);

  // 더미 데이터 생성
  const [products] = useState<Product[]>(generateDummyProducts(24));

  // 이미지 호버 상태를 관리하는 객체
  const [hoveredProducts, setHoveredProducts] = useState<{
    [key: number]: boolean;
  }>({});

  const sortOptions = {
    newest: "신상품",
    priceLow: "낮은 가격",
    priceHigh: "높은 가격",
    popular: "인기상품",
  };

  // 정렬된 상품 목록 가져오기
  const getSortedProducts = () => {
    return [...products].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
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

  // 호버 상태 토글 함수
  const handleMouseEnter = useCallback((productId: number) => {
    setHoveredProducts((prev) => ({
      ...prev,
      [productId]: true,
    }));
  }, []);

  const handleMouseLeave = useCallback((productId: number) => {
    setHoveredProducts((prev) => ({
      ...prev,
      [productId]: false,
    }));
  }, []);

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
                          ? viewType === "outfit"
                            ? product.productImageUrl
                            : product.outfitImageUrl
                          : viewType === "outfit"
                          ? product.outfitImageUrl
                          : product.productImageUrl
                      }
                      width={300}
                      height={400}
                      alt={product.name}
                      className="w-full h-full object-cover aspect-[3/4] transition-opacity duration-300"
                    />
                  </CardBody>
                  <CardFooter className="flex flex-row justify-between items-start px-3 py-2">
                    <p className="text-sm">{product.name}</p>
                    <div className="flex items-end flex-col gap-1">
                      <span className="text-xs text-default-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs">
                        KRW{" "}
                        {formatPrice(
                          Math.floor(
                            product.price -
                              product.price * (product.discount / 100)
                          )
                        )}
                      </span>
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
