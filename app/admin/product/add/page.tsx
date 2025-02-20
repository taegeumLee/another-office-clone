"use client";

import { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";

interface ImageFile {
  file: File;
  preview: string;
  type: "OUTFIT" | "PRODUCT" | "ADDITIONAL";
}

interface FormErrors {
  name?: string;
  price?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  gender?: string;
  images?: string;
  sizes?: string;
  colors?: string;
}

interface UploadProgress {
  [key: string]: number;
}

interface PreviewImage {
  file: File;
  preview: string;
}

interface VariantStock {
  sizeId: string;
  colorId: string;
  stock: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [gender, setGender] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [sizes, setSizes] = useState<string[]>(["01", "02", "03", "04", "05"]);
  const [colors, setColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [colorName, setColorName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [outfitImage, setOutfitImage] = useState<File | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [outfitPreview, setOutfitPreview] = useState<string | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<PreviewImage[]>(
    []
  );
  const [variants, setVariants] = useState<VariantStock[]>([]);

  // 사이즈와 컬러 선택 시 재고 입력 UI를 위한 상태
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [variantStock, setVariantStock] = useState(0);

  const handleOutfitImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOutfitImage(file);
      // 기존 미리보기 URL 해제
      if (outfitPreview) URL.revokeObjectURL(outfitPreview);
      setOutfitPreview(createPreview(file));
    }
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      if (productPreview) URL.revokeObjectURL(productPreview);
      setProductPreview(createPreview(file));
    }
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    // 기존 미리보기 URL들 해제
    additionalPreviews.forEach((preview) =>
      URL.revokeObjectURL(preview.preview)
    );

    const newPreviews = files.map((file) => ({
      file,
      preview: createPreview(file),
    }));

    setAdditionalImages(files);
    setAdditionalPreviews(newPreviews);
  };

  // 컬러 추가 함수
  const handleAddColor = () => {
    if (!colorName.trim()) {
      alert("컬러명을 입력해주세요.");
      return;
    }

    if (colors.includes(colorName)) {
      alert("이미 존재하는 컬러입니다.");
      return;
    }

    setColors([...colors, colorName]);
    setSelectedColor(colorName);
    setColorName("");
  };

  // 재고 추가 함수 수정
  const handleAddVariant = () => {
    if (!selectedSize || !colorName || variantStock <= 0) {
      alert("컬러명, 사이즈, 재고량을 모두 입력해주세요.");
      return;
    }

    // 중복 사이즈 체크
    const isDuplicate = variants.some((v) => v.sizeId === selectedSize);
    if (isDuplicate) {
      alert("이미 존재하는 사이즈입니다.");
      return;
    }

    const newVariant: VariantStock = {
      sizeId: selectedSize,
      colorId: colorName,
      stock: variantStock,
    };

    setVariants([...variants, newVariant]);
    setSelectedSize("");
    setVariantStock(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // 1. 제품 정보 등록
      const productData = {
        name,
        description,
        price: Number(price),
        category,
        subCategory,
        gender,
        variants: variants.map((variant) => ({
          sizeId: variant.sizeId,
          colorId: variant.colorId,
          stock: variant.stock,
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "제품 등록 실패");
      }

      const data = await res.json();
      const { product } = data;

      // 첫 번째 variant의 ID만 사용
      const firstVariantId = product.variants[0]?.id;
      if (!firstVariantId) {
        throw new Error("Variant creation failed");
      }

      // 2. 이미지 업로드 - 첫 번째 variant에만 이미지 연결
      const uploadPromises = [];

      if (outfitImage) {
        uploadPromises.push(
          uploadImage(outfitImage, "OUTFIT", 0, product.id, firstVariantId)
        );
      }
      if (productImage) {
        uploadPromises.push(
          uploadImage(productImage, "PRODUCT", 1, product.id, firstVariantId)
        );
      }
      for (let i = 0; i < additionalImages.length; i++) {
        uploadPromises.push(
          uploadImage(
            additionalImages[i],
            "ADDITIONAL",
            i + 2,
            product.id,
            firstVariantId
          )
        );
      }

      // 모든 이미지 업로드를 병렬로 처리
      await Promise.all(uploadPromises);

      alert("제품이 성공적으로 등록되었습니다.");
      router.push("/admin/product");
      router.refresh();
    } catch (error: any) {
      console.error("제품 등록 에러:", error);
      alert(error.message || "제품 등록 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // uploadImage 함수도 수정
  const uploadImage = async (
    file: File,
    type: string,
    order: number,
    productId: string,
    variantId: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("productId", productId);
      formData.append("variantId", variantId);
      formData.append("order", order.toString());

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "이미지 업로드 실패");
      }

      return uploadRes.json();
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  // 폼 유효성 검사 함수
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!name) newErrors.name = "제품명을 입력해주세요.";
    if (!description) newErrors.description = "설명을 입력해주세요.";
    if (!price) newErrors.price = "가격을 입력해주세요.";
    if (!category) newErrors.category = "카테고리를 선택해주세요.";
    if (!subCategory) newErrors.subCategory = "서브카테고리를 입력해주세요.";
    if (!gender) newErrors.gender = "성별을 선택해주세요.";
    if (!colorName) newErrors.colors = "컬러를 입력해주세요.";
    if (variants.length === 0)
      newErrors.sizes = "최소 하나의 사이즈와 재고를 추가해주세요.";
    if (!outfitImage || !productImage)
      newErrors.images = "필수 이미지를 업로드해주세요.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 이미지 미리보기 생성 함수
  const createPreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // 컴포넌트 언마운트 시 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (outfitPreview) URL.revokeObjectURL(outfitPreview);
      if (productPreview) URL.revokeObjectURL(productPreview);
      additionalPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.preview)
      );
    };
  }, [outfitPreview, productPreview, additionalPreviews]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">제품 등록</h1>

      <form
        onSubmit={(e) => {
          console.log("폼 제출 이벤트 발생");
          handleSubmit(e);
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-6">
          <Input
            label="제품명"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            errorMessage={errors.name}
            isInvalid={!!errors.name}
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

        <div className="grid grid-cols-3 gap-6">
          <Select
            label="카테고리"
            value={category}
            onChange={(e) => {
              console.log("선택된 카테고리:", e.target.value);
              setCategory(e.target.value);
            }}
            required
          >
            <SelectItem key="OUTER" value={"OUTER"}>
              아우터
            </SelectItem>
            <SelectItem key="TOP" value={"TOP"}>
              상의
            </SelectItem>
            <SelectItem key="BOTTOM" value={"BOTTOM"}>
              하의
            </SelectItem>
            <SelectItem key="ACCESSORIES" value={"ACCESSORIES"}>
              악세서리
            </SelectItem>
          </Select>

          <Input
            label="서브 카테고리"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            required
          />

          <Select
            label="성별"
            value={gender}
            onChange={(e) => {
              console.log("선택된 성별:", e.target.value);
              setGender(e.target.value);
            }}
            required
          >
            <SelectItem key="MEN" value={"MEN"}>
              남성
            </SelectItem>
            <SelectItem key="WOMEN" value={"WOMEN"}>
              여성
            </SelectItem>
            <SelectItem key="UNISEX" value={"UNISEX"}>
              유니섹스
            </SelectItem>
          </Select>
        </div>

        {/* 이미지 업로드 섹션 */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-default-700">
                아웃핏 이미지 (필수)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleOutfitImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary-600
                  cursor-pointer"
                required
              />
            </div>
            {outfitPreview && (
              <div className="relative mt-2 inline-block">
                <img
                  src={outfitPreview}
                  alt="Outfit preview"
                  className="w-32 h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setOutfitImage(null);
                    URL.revokeObjectURL(outfitPreview);
                    setOutfitPreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-default-700">
                제품 이미지 (필수)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProductImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary-600
                  cursor-pointer"
                required
              />
            </div>
            {productPreview && (
              <div className="relative mt-2 inline-block">
                <img
                  src={productPreview}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProductImage(null);
                    URL.revokeObjectURL(productPreview);
                    setProductPreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-default-700">
                추가 이미지 (선택, 여러 장 선택 가능)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary-600
                  cursor-pointer"
              />
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              {additionalPreviews.map((preview, index) => (
                <div key={index} className="relative inline-block">
                  <img
                    src={preview.preview}
                    alt={`Additional preview ${index + 1}`}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPreviews = [...additionalPreviews];
                      const newFiles = [...additionalImages];
                      URL.revokeObjectURL(preview.preview);
                      newPreviews.splice(index, 1);
                      newFiles.splice(index, 1);
                      setAdditionalPreviews(newPreviews);
                      setAdditionalImages(newFiles);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 컬러 입력 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">컬러 설정</h3>
          <div className="flex gap-4 items-end">
            <Input
              type="text"
              label="컬러명"
              placeholder="예: 블랙"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="flex-1"
              isDisabled={variants.length > 0} // 재고가 추가되면 컬러 변경 불가
            />
          </div>
        </div>

        {/* 재고 관리 섹션 */}
        {colorName && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {colorName} 사이즈/재고 관리
            </h3>
            <div className="flex gap-4 items-end">
              <Select
                label="사이즈"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </Select>

              <Input
                type="number"
                label="재고량"
                value={variantStock.toString()}
                onChange={(e) => setVariantStock(parseInt(e.target.value))}
                min={0}
              />

              <Button onClick={handleAddVariant}>재고 추가</Button>
            </div>
          </div>
        )}

        {/* 재고 목록 테이블 */}
        {variants.length > 0 && (
          <div className="mt-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>사이즈</th>
                  <th>재고량</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={index}>
                    <td>{variant.sizeId}</td>
                    <td>{variant.stock}</td>
                    <td>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => {
                          setVariants(variants.filter((_, i) => i !== index));
                          // 모든 재고가 삭제되면 컬러 수정 가능
                          if (variants.length === 1) {
                            setColorName("");
                          }
                        }}
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Button
          type="submit"
          color="primary"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "등록 중..." : "제품 등록"}
        </Button>
      </form>

      {/* 이미지 업로드 섹션에 진행률 표시 추가 */}
      {Object.entries(uploadProgress).map(([filename, progress]) => (
        <div key={filename} className="w-full mt-2">
          <div className="text-sm text-gray-600">{filename}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
