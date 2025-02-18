"use client";

import { useState, useCallback, useEffect } from "react";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDropzone } from "react-dropzone";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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

export default function AdminPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [gender, setGender] = useState("");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<{ name: string; code: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [outfitImage, setOutfitImage] = useState<File | null>(null);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [outfitPreview, setOutfitPreview] = useState<string | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<PreviewImage[]>(
    []
  );

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

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleAddSize = (size: string) => {
    if (!sizes.includes(size)) {
      setSizes([...sizes, size]);
    }
  };

  const handleRemoveSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  const handleAddColor = () => {
    if (!colorName.trim()) {
      setErrors((prev) => ({ ...prev, colors: "컬러명을 입력해주세요" }));
      return;
    }
    if (!colors.find((c) => c.name === colorName)) {
      setColors([...colors, { name: colorName, code: colorCode }]);
      setColorName("");
      setColorCode("#000000");
      setErrors((prev) => ({ ...prev, colors: undefined }));
    }
  };

  const handleRemoveColor = (name: string) => {
    setColors(colors.filter((c) => c.name !== name));
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
        quantity: Number(quantity) || 0,
        sizes: sizes.map((size) => ({ name: size })),
        colors: colors.map((color) => ({ name: color.name, code: color.code })),
      };

      console.log("전송할 데이터:", productData);

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
      console.log("서버 응답:", data);

      if (!data.success || !data.product?.id) {
        throw new Error("제품 ID를 받지 못했습니다.");
      }

      const productId = data.product.id;

      // 2. 이미지 업로드
      const uploadImage = async (file: File, type: string, order: number) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("productId", productId);
        formData.append("order", order.toString());

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "이미지 업로드 실패");
        }
      };

      // 필수 이미지 업로드
      if (outfitImage) {
        await uploadImage(outfitImage, "OUTFIT", 0);
      }
      if (productImage) {
        await uploadImage(productImage, "PRODUCT", 1);
      }

      // 추가 이미지 업로드
      for (let i = 0; i < additionalImages.length; i++) {
        await uploadImage(additionalImages[i], "ADDITIONAL", i + 2);
      }

      alert("제품이 성공적으로 등록되었습니다.");
      // 폼 초기화
      resetForm();
    } catch (error: any) {
      console.error("제품 등록 에러:", error);
      alert(error.message || "제품 등록 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setSubCategory("");
    setGender("");
    setQuantity("");
    setSizes([]);
    setColors([]);
    setOutfitImage(null);
    setProductImage(null);
    setAdditionalImages([]);
    setOutfitPreview(null);
    setProductPreview(null);
    setAdditionalPreviews([]);
    setErrors({});
  };

  // 폼 유효성 검사 함수
  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!name) {
      newErrors.name = "제품명을 입력해주세요.";
      isValid = false;
    }

    if (!price || Number(price) <= 0) {
      newErrors.price = "올바른 가격을 입력해주세요.";
      isValid = false;
    }

    if (!category) {
      newErrors.category = "카테고리를 선택해주세요.";
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = "성별을 선택해주세요.";
      isValid = false;
    }

    if (!description) {
      newErrors.description = "제품 설명을 입력해주세요.";
      isValid = false;
    }

    if (!subCategory) {
      newErrors.subCategory = "서브 카테고리를 입력해주세요.";
      isValid = false;
    }

    if (sizes.length === 0) {
      newErrors.sizes = "최소 하나의 사이즈를 선택해주세요.";
      isValid = false;
    }

    if (colors.length === 0) {
      newErrors.colors = "최소 하나의 컬러를 추가해주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
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

        <Input
          type="number"
          label="수량"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          required
        />

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

        {/* 사이즈 선택 섹션 */}
        <div>
          <label className="block text-sm font-medium mb-2">사이즈</label>
          <div className="flex flex-wrap gap-2">
            {["01", "02", "03", "04", "05"].map((size) => (
              <Button
                key={size}
                type="button"
                size="sm"
                variant={sizes.includes(size) ? "flat" : "light"}
                onClick={() =>
                  sizes.includes(size)
                    ? handleRemoveSize(size)
                    : handleAddSize(size)
                }
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* 컬러 선택 섹션 */}
        <div>
          <label className="block text-sm font-medium mb-2">컬러</label>
          <div className="flex flex-wrap gap-4 items-center">
            {colors.map(({ name, code }) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: code }}
                />
                <span className="text-sm">{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(name)}
                  className="text-red-500"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="컬러명"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                size="sm"
                className="w-24"
              />
              <Input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                size="sm"
                className="w-24"
              />
              <Button type="button" size="sm" onClick={handleAddColor}>
                추가
              </Button>
            </div>
            {errors.colors && (
              <p className="text-red-500 text-sm w-full">{errors.colors}</p>
            )}
          </div>
        </div>

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
