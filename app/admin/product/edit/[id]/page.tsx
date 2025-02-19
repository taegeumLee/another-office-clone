"use client";

import { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import ImageUploader from "@/app/components/ImageUploader";
import { Category, Gender } from "@prisma/client";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  subCategory: string;
  gender: Gender;
  variants: {
    id: string;
    size: {
      id: string;
      name: string;
    };
    color: {
      id: string;
      name: string;
      code: string;
    };
    stock: number;
    images: {
      id: string;
      url: string;
      type: string;
      order: number;
    }[];
  }[];
}

export default function EditProductPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 상태 관리
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>(Category.TOP);
  const [subCategory, setSubCategory] = useState("");
  const [gender, setGender] = useState<Gender>(Gender.UNISEX);
  const [variants, setVariants] = useState<any[]>([]);
  const [outfitImage, setOutfitImage] = useState<File | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [variantStock, setVariantStock] = useState(0);
  const [availableSizes] = useState<string[]>(["01", "02", "03", "04", "05"]);
  const [outfitImageUrl, setOutfitImageUrl] = useState<string>("");
  const [productImageUrl, setProductImageUrl] = useState<string>("");
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([]);

  // 제품 데이터 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${id}`);
        if (!response.ok) throw new Error("제품을 불러올 수 없습니다.");
        const data = await response.json();

        // 받아온 데이터 로깅
        console.log("Fetched Product Data:", data);

        setProduct(data);

        // 데이터 초기화
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price.toString());
        setCategory(data.category);
        setSubCategory(data.subCategory);
        setGender(data.gender);
        setVariants(data.variants);

        // 이미지 URL 설정 로깅
        console.log("First Variant Images:", data.variants[0]?.images);

        // 이미지 URL 설정
        if (data.variants[0]?.images) {
          const outfitImg = data.variants[0].images.find(
            (img: any) => img.type === "OUTFIT"
          );
          const productImg = data.variants[0].images.find(
            (img: any) => img.type === "PRODUCT"
          );
          const additionalImgs = data.variants[0].images.filter(
            (img: any) => img.type === "ADDITIONAL"
          );

          console.log("Found Images:", {
            outfit: outfitImg,
            product: productImg,
            additional: additionalImgs,
          });

          setOutfitImageUrl(outfitImg?.url || "");
          setProductImageUrl(productImg?.url || "");
          setAdditionalImageUrls(additionalImgs.map((img: any) => img.url));
        }
      } catch (error) {
        console.error("제품 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleVariantChange = (
    variantId: string,
    field: string,
    value: any
  ) => {
    setVariants(
      variants.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name,
        description,
        price: Number(price),
        category,
        subCategory,
        gender,
        variants: variants.map((variant) => ({
          id: variant.id,
          stock: Number(variant.stock),
          size: {
            id: variant.size.name,
            name: variant.size.name,
          },
          color: {
            id: variant.color.code,
            name: variant.color.name,
            code: variant.color.code,
          },
        })),
      };

      // 먼저 제품 정보 업데이트
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "제품 수정 실패");
      }

      // 이미지 업로드 처리
      if (outfitImage || productImage || additionalImages.length > 0) {
        const uploadPromises = [];

        if (outfitImage) {
          uploadPromises.push(uploadImage(outfitImage, "OUTFIT", 0));
        }
        if (productImage) {
          uploadPromises.push(uploadImage(productImage, "PRODUCT", 1));
        }
        if (additionalImages.length > 0) {
          uploadPromises.push(
            ...additionalImages.map((img, idx) =>
              uploadImage(img, "ADDITIONAL", idx + 2)
            )
          );
        }

        await Promise.all(uploadPromises);
      }

      alert("제품이 성공적으로 수정되었습니다.");
      router.push("/admin/product");
      router.refresh();
    } catch (error: any) {
      console.error("제품 수정 에러:", error);
      alert(error.message || "제품 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (file: File, type: string, order: number) => {
    try {
      // 첫 번째 variant의 ID를 사용
      const firstVariantId = variants[0]?.id;
      if (!firstVariantId) {
        throw new Error("No variant found");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("productId", id);
      formData.append("variantId", firstVariantId);
      formData.append("order", order.toString());

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "이미지 업로드 실패");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  // 새로운 variant 추가 함수
  const handleAddVariant = () => {
    if (!selectedSize || !colorName || variantStock <= 0) {
      alert("사이즈, 컬러, 재고량을 모두 입력해주세요.");
      return;
    }

    // 중복 체크
    const isDuplicate = variants.some(
      (v) => v.size.name === selectedSize && v.color.name === colorName
    );

    if (isDuplicate) {
      alert("이미 존재하는 사이즈/컬러 조합입니다.");
      return;
    }

    // 첫 번째 variant의 이미지를 복사
    const existingImages = variants[0]?.images || [];

    const newVariant = {
      id: `temp-${Date.now()}`,
      size: {
        id: selectedSize,
        name: selectedSize,
      },
      color: {
        id: colorCode,
        name: colorName,
        code: colorCode,
      },
      stock: variantStock,
      images: [...existingImages],
    };

    setVariants([...variants, newVariant]);
    setSelectedSize("");
    setColorName("");
    setColorCode("#000000");
    setVariantStock(0);
  };

  // variant 삭제 함수
  const handleRemoveVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  if (loading) return <div>로딩 중...</div>;
  if (!product) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        as={Link}
        href="/admin/product"
        variant="light"
        className="mb-4"
        startContent={<ArrowLeftIcon className="w-4 h-4" />}
      >
        뒤로 가기
      </Button>

      <h1 className="text-2xl font-bold mb-6">제품 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="제품명"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="가격"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="제품 설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="카테고리"
            selectedKeys={[category]}
            onChange={(e) => setCategory(e.target.value as Category)}
            required
          >
            {Object.values(Category).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="서브 카테고리"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            required
          />

          <Select
            label="성별"
            selectedKeys={[gender]}
            onChange={(e) => setGender(e.target.value as Gender)}
            required
          >
            {Object.values(Gender).map((gen) => (
              <SelectItem key={gen} value={gen}>
                {gen}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">사이즈/컬러/재고 관리</h2>

          {/* 새 variant 추가 폼 */}
          <div className="grid grid-cols-4 gap-4 p-4 border rounded bg-gray-50">
            <Select
              label="사이즈"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {availableSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </Select>

            <div className="flex gap-2 col-span-2">
              <Input
                type="text"
                label="컬러명"
                placeholder="예: 블랙"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="color"
                label="컬러"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-24"
              />
            </div>

            <div className="flex gap-2 items-end">
              <Input
                type="number"
                label="재고량"
                value={variantStock.toString()}
                onChange={(e) => setVariantStock(parseInt(e.target.value) || 0)}
                min={0}
                className="flex-1"
              />
              <Button color="primary" onClick={handleAddVariant}>
                추가
              </Button>
            </div>
          </div>

          {/* Variants 목록 */}
          <div className="space-y-2">
            {variants
              .sort((a, b) => {
                // 숫자로 변환하여 비교 (01, 02, 03 등의 순서대로 정렬)
                const sizeA = parseInt(a.size.name);
                const sizeB = parseInt(b.size.name);
                return sizeA - sizeB;
              })
              .map((variant) => (
                <div
                  key={variant.id}
                  className="grid grid-cols-4 gap-4 p-4 border rounded items-center"
                >
                  <div>
                    <p className="text-sm font-medium mb-1">사이즈</p>
                    <p>{variant.size.name}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium mb-1">컬러</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: variant.color.code }}
                      />
                      <p>{variant.color.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-end">
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "stock", e.target.value)
                      }
                      min={0}
                      className="flex-1"
                    />
                    <Button
                      color="danger"
                      variant="light"
                      onClick={() => handleRemoveVariant(variant.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium">이미지 수정</h2>
          <div className="grid grid-cols-3 gap-4">
            <ImageUploader
              label="착용 이미지"
              onChange={(file) => setOutfitImage(file)}
              currentImage={outfitImageUrl}
            />
            <ImageUploader
              label="제품 이미지"
              onChange={(file) => setProductImage(file)}
              currentImage={productImageUrl}
            />
            <ImageUploader
              label="추가 이미지"
              multiple
              onChange={() => {}}
              onMultipleChange={setAdditionalImages}
              currentImages={additionalImageUrls}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            color="danger"
            variant="light"
            as={Link}
            href="/admin/product"
            type="button"
          >
            취소
          </Button>
          <Button color="primary" type="submit" isLoading={isSubmitting}>
            수정하기
          </Button>
        </div>
      </form>
    </div>
  );
}
