"use client";

import { useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@nextui-org/react";

interface ImageCropperProps {
  image: string;
  aspect?: number;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  image,
  aspect,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const getCroppedImg = () => {
    if (!imageRef) return;

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      imageRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const base64Image = canvas.toDataURL("image/jpeg");
    onCropComplete(base64Image);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-2xl w-full">
        <h3 className="text-lg font-medium mb-4">이미지 크롭</h3>
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          aspect={aspect}
          className="max-h-[60vh]"
        >
          <img
            src={image}
            onLoad={(e) => setImageRef(e.currentTarget)}
            alt="Crop"
          />
        </ReactCrop>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="danger" variant="light" onClick={onCancel}>
            취소
          </Button>
          <Button color="primary" onClick={getCroppedImg}>
            적용
          </Button>
        </div>
      </div>
    </div>
  );
}
