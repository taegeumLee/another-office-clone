"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  gender: string;
  variants: {
    id: string;
    stock: number;
    size: { name: string };
    color: { name: string; code: string };
    images: {
      id: string;
      url: string;
      type: string;
    }[];
  }[];
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // "all", "in-stock", "out-of-stock"

  const fetchProducts = async (page: number) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedGender && { gender: selectedGender }),
        ...(selectedSize && { size: selectedSize }),
        ...(stockFilter !== "all" && { stock: stockFilter }),
      });

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("제품 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    selectedGender,
    selectedSize,
    stockFilter,
  ]);

  const getTotalStock = (variants: Product["variants"]) => {
    return variants.reduce((sum, variant) => sum + variant.stock, 0);
  };

  const getMainImage = (variants: Product["variants"]) => {
    // 모든 variant의 이미지를 순회하면서 OUTFIT 타입의 이미지를 찾음
    for (const variant of variants) {
      const outfitImage = variant.images?.find((img) => img.type === "OUTFIT");
      if (outfitImage?.url) {
        return outfitImage.url;
      }
    }

    // OUTFIT 이미지가 없으면 PRODUCT 이미지를 찾음
    for (const variant of variants) {
      const productImage = variant.images?.find(
        (img) => img.type === "PRODUCT"
      );
      if (productImage?.url) {
        return productImage.url;
      }
    }

    return null;
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("정말 이 제품을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("제품 삭제에 실패했습니다.");
      }

      // 성공적으로 삭제되면 목록에서 제거
      setProducts(products.filter((product) => product.id !== productId));
      alert("제품이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("제품 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">제품 관리</h1>
        <Link href="/admin/product/add">
          <Button color="primary">새 제품 등록</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <Input
          placeholder="제품명으로 검색"
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          }
          className="w-64"
        />
        <Select
          placeholder="카테고리"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="w-40"
        >
          <SelectItem key="" value="">
            전체
          </SelectItem>
          <SelectItem key="OUTER" value="OUTER">
            아우터
          </SelectItem>
          <SelectItem key="TOP" value="TOP">
            상의
          </SelectItem>
          <SelectItem key="BOTTOM" value="BOTTOM">
            하의
          </SelectItem>
          <SelectItem key="ACCESSORIES" value="ACCESSORIES">
            악세서리
          </SelectItem>
        </Select>
        <Select
          placeholder="성별"
          value={selectedGender}
          onChange={(e) => {
            setSelectedGender(e.target.value);
            setCurrentPage(1);
          }}
          className="w-40"
        >
          <SelectItem key="" value="">
            전체
          </SelectItem>
          <SelectItem key="MEN" value="MEN">
            남성
          </SelectItem>
          <SelectItem key="WOMEN" value="WOMEN">
            여성
          </SelectItem>
          <SelectItem key="UNISEX" value="UNISEX">
            유니섹스
          </SelectItem>
        </Select>
        <Select
          placeholder="사이즈"
          value={selectedSize}
          onChange={(e) => {
            setSelectedSize(e.target.value);
            setCurrentPage(1);
          }}
          className="w-32"
        >
          <SelectItem key="" value="">
            전체
          </SelectItem>
          <SelectItem key="01" value="01">
            01
          </SelectItem>
          <SelectItem key="02" value="02">
            02
          </SelectItem>
          <SelectItem key="03" value="03">
            03
          </SelectItem>
          <SelectItem key="04" value="04">
            04
          </SelectItem>
          <SelectItem key="05" value="05">
            05
          </SelectItem>
        </Select>
        <Select
          placeholder="재고 상태"
          value={stockFilter}
          onChange={(e) => {
            setStockFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-40"
        >
          <SelectItem key="all" value="all">
            전체
          </SelectItem>
          <SelectItem key="in-stock" value="in-stock">
            재고 있음
          </SelectItem>
          <SelectItem key="out-of-stock" value="out-of-stock">
            재고 없음
          </SelectItem>
        </Select>
      </div>

      <Table aria-label="제품 목록" className="mb-6">
        <TableHeader>
          <TableColumn>이미지</TableColumn>
          <TableColumn>제품명</TableColumn>
          <TableColumn>카테고리</TableColumn>
          <TableColumn>성별</TableColumn>
          <TableColumn>가격</TableColumn>
          <TableColumn>총 재고</TableColumn>
          <TableColumn>컬러</TableColumn>
          <TableColumn>사이즈</TableColumn>
          <TableColumn>등록일</TableColumn>
          <TableColumn>관리</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          emptyContent={isLoading ? "로딩중..." : "등록된 제품이 없습니다."}
        >
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {getMainImage(product.variants) && (
                  <Image
                    src={getMainImage(product.variants)!}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="object-cover rounded"
                    unoptimized
                  />
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.gender}</TableCell>
              <TableCell>{product.price.toLocaleString()}원</TableCell>
              <TableCell>{getTotalStock(product.variants)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {Array.from(
                    new Set(product.variants.map((v) => v.color.name))
                  ).map((colorName) => (
                    <span
                      key={colorName}
                      className="px-2 py-1 text-xs rounded bg-gray-100"
                    >
                      {colorName}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {Array.from(
                    new Set(product.variants.map((v) => v.size.name))
                  ).map((sizeName) => (
                    <span
                      key={sizeName}
                      className="px-2 py-1 text-xs rounded bg-gray-100"
                    >
                      {sizeName}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {new Date(product.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    as={Link}
                    href={`/admin/product/edit/${product.id}`}
                    size="sm"
                    color="primary"
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    삭제
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        <Pagination
          total={totalPages}
          page={currentPage}
          onChange={(page) => {
            setCurrentPage(page);
            window.scrollTo(0, 0);
          }}
        />
      </div>
    </div>
  );
}
