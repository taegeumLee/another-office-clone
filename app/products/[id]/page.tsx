"use client";

import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
interface Props {
  params: {
    id: string;
  };
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
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
  const productId = parseInt(params.id);

  // TODO: 실제 데이터베이스에서 제품 정보를 가져오는 로직으로 대체
  if (isNaN(productId) || productId < 1) {
    notFound();
  }

  // 임시 이미지 데이터
  const images = [
    `/images/product/${productId}/outfit.jpg`,
    `/images/product/${productId}/product.jpg`,
    `/images/product/${productId}/detail1.jpg`,
    `/images/product/${productId}/detail2.jpg`,
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 relative">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex gap-8 h-[calc(100vh-120px)]">
            {/* 왼쪽 이미지 섹션 (2/3) */}
            <div className="w-2/3 overflow-y-auto pr-4 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image}
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
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-lg">Legacy Single Wool Blazer (Black)</h1>
                  <div className="space-y-2">
                    <div className="flex gap-1 items-center">
                      <span className="text-default-400 line-through text-sm">
                        248,000
                      </span>
                      <span className="text-sm text-default-600">
                        KRW 223,200
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-sm">사이즈</h2>
                    <div className="flex gap-2">
                      {["01", "02", "03", "04"].map((size) => (
                        <button
                          key={size}
                          className="px-2 py-1 border border-white rounded hover:border-gray-800 transition-colors"
                        >
                          <span className="text-sm">{size}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors">
                      구매하기
                    </button>
                    <button className="px-4 py-3 border rounded text-xs hover:border-black transition-colors">
                      <ShoppingCartIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 제품 상세 정보 아코디언들 */}
                  <div className="space-y-0">
                    <Accordion title="제품 설명">
                      <pre className="text-sm text-gray-600 leading-relaxed">
                        A/O.에서 심혈을 기울여 선보이는 비즈니스 수트 Legacy
                        Set-up을 소개합니다 본 제품은 팬츠와 셋업으로 착용
                        가능한 Legacy Single Wool Blazer입니다 Legacy라는
                        이름처럼 전통적인 수트 디자인을 A/O.만의 모던한
                        실루엣으로 표현했습니다 차분하게 몸을 감싸는 편안한
                        핏으로 약간의 체형 변화와 트렌드의 영향을 받지 않는
                        수트를 만들고자 했습니다 OEKO-TEX 인증을 거친 부드러운
                        텍스처의 울블렌드 원단을 사용했으며, 라펠, 자켓 전면부,
                        포켓에 스티치(호시)를 넣어 라펠부터 밑단까지의 부드러운
                        곡선과 볼륨감을 강조하였습니다 스티치(호시)는 라펠과
                        포켓을 들뜨지 않고 안착시켜주는 역할을 합니다 섬세한
                        테일러링을 바탕으로 제작한 만큼 10년 뒤에 꺼내 입어도
                        클래식하고 모던한 감각이 유지되게끔 많은 노력을 기울인
                        수트이며, 단품으로도 좀 더 가볍게 착용하실 수 있습니다
                        *OEKO-TEX® STANDARD 100이란? 유럽의 섬유 및 가죽
                        제품에서 가장 엄격하고 널리 인정받는 안전 기준 중 하나인
                        OEKO-TEX® STANDARD 100은 소비자들이 안심할 수 있는
                        제품을 보증하는 글로벌 인증입니다 국제 섬유 및 가죽
                        생태학 연구 및 실험 협회가 발급하는 인증으로 유해 물질이
                        없는 제품임을 보증하며, 원자재부터 완성된 제품까지 모든
                        생산 단계에서 유해 물질에 대한 검사를 요구합니다 특히,
                        피부와 직접 접촉하는 섬유 제품에 대한 유해 물질 관리
                        기준은 더욱 엄격하게 적용됩니다 *상세 이미지가 실제
                        컬러와 가장 유사합니다 미묘한 컬러를 사용하는 A/O.
                        의복의 특성상 원단의 결과 보는 방향, 형광등 빛과 자연광
                        아래서 다른 톤으로 보일 수 있습니다 본 이미지는 자연광
                        아래 보이는 톤을 기준으로 실내에서 보이는 것보다 약간
                        밝게 표현되었습니다 *Standard fit *main pocket 2 / chest
                        pocket 1 / inside pocket 2 *겉감 : Wool 30%, Polyester
                        70% / 안감 : Polyester 100% *Horn Button ( 천연 소뿔
                        단추를 사용하여 미세한 흠집이 있을 수 있습니다 )
                      </pre>
                    </Accordion>

                    <Accordion title="소재">
                      <p className="text-sm text-gray-600">
                        겉감: WOOL 90%, NYLON 10%
                        <br />
                        안감: POLYESTER 100%
                      </p>
                    </Accordion>

                    <Accordion title="사이즈 정보">
                      <p className="text-sm text-gray-600">
                        01: 어깨 42 가슴 49 소매 62 총장 71
                        <br />
                        02: 어깨 43 가슴 51 소매 63 총장 72
                        <br />
                        03: 어깨 44 가슴 53 소매 64 총장 73
                        <br />
                        04: 어깨 45 가슴 55 소매 65 총장 74
                      </p>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
