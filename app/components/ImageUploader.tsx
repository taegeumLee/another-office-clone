"use client";

import { ChangeEvent, useRef } from "react";
import Image from "next/image";
import { Button } from "@nextui-org/react";

interface ImageUploaderProps {
  label: string;
  onChange: (file: File | null) => void;
  currentImage?: string;
  multiple?: boolean;
  currentImages?: string[];
  onMultipleChange?: (files: File[]) => void;
}

export default function ImageUploader({
  label,
  onChange,
  currentImage,
  multiple,
  currentImages,
  onMultipleChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (multiple && onMultipleChange) {
      onMultipleChange(Array.from(files));
    } else {
      onChange(files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="border-2 border-dashed rounded-lg p-4 text-center">
        {currentImage && (
          <div className="mb-4">
            <Image
              src={currentImage}
              alt={label}
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
        )}
        {currentImages && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {currentImages.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                alt={`${label} ${idx + 1}`}
                width={100}
                height={100}
                className="mx-auto"
              />
            ))}
          </div>
        )}
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple={multiple}
          accept="image/*"
        />
        <Button
          onClick={() => inputRef.current?.click()}
          variant="bordered"
          className="w-full"
        >
          이미지 {multiple ? "추가" : "선택"}
        </Button>
      </div>
    </div>
  );
}
