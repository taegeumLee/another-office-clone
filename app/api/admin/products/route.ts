import { prisma } from "@/lib/prisma";
import { Category, Gender, ImageType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // // 관리자 권한 확인 추가
    // const user = await auth();
    // if (!user || user.role !== "ADMIN") {
    //   return new Response(JSON.stringify({ error: "권한이 없습니다." }), {
    //     headers: { "Content-Type": "application/json" },
    //     status: 403,
    //   });
    // }

    let data;
    try {
      const text = await req.text();
      console.log("받은 원본 데이터:", text);

      if (!text) {
        return Response.json(
          { error: "요청 데이터가 비어있습니다." },
          { status: 400 }
        );
      }

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON 파싱 에러:", parseError);
        return Response.json(
          { error: "잘못된 JSON 형식입니다." },
          { status: 400 }
        );
      }
    } catch (readError) {
      console.error("요청 데이터 읽기 에러:", readError);
      return Response.json(
        { error: "요청 데이터를 읽을 수 없습니다." },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object") {
      return Response.json(
        {
          error: "유효하지 않은 데이터 형식입니다.",
          received: data,
        },
        { status: 400 }
      );
    }

    // 데이터 로깅
    console.log("처리할 데이터:", {
      name: data.name,
      price: data.price,
      category: data.category,
      gender: data.gender,
      description: data.description,
      subCategory: data.subCategory,
      sizes: data.sizes,
      colors: data.colors,
    });

    // 데이터 타입 검증
    console.log("카테고리 검증:", {
      received: data.category,
      validValues: Object.values(Category),
      isValid: Object.values(Category).includes(data.category),
    });

    if (!Object.values(Category).includes(data.category)) {
      console.log("카테고리 검증 실패");
      return Response.json(
        { error: "올바르지 않은 카테고리입니다." },
        { status: 400 }
      );
    }

    console.log("성별 검증:", {
      received: data.gender,
      validValues: Object.values(Gender),
      isValid: Object.values(Gender).includes(data.gender),
    });

    if (!Object.values(Gender).includes(data.gender)) {
      console.log("성별 검증 실패");
      return Response.json(
        { error: "올바르지 않은 성별 값입니다." },
        { status: 400 }
      );
    }

    // 필수 필드 검증
    const requiredFields = {
      name: data.name,
      price: data.price,
      category: data.category,
      gender: data.gender,
      description: data.description,
      subCategory: data.subCategory,
    };

    console.log("필수 필드 검증:", requiredFields);

    if (Object.values(requiredFields).some((field) => !field)) {
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      console.log("누락된 필드:", missingFields);
      return Response.json(
        {
          error: "필수 필드가 누락되었습니다.",
          missingFields,
        },
        { status: 400 }
      );
    }

    try {
      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          category: data.category as Category,
          subCategory: data.subCategory,
          gender: data.gender as Gender,
          quantity: Number(data.quantity) || 0,
          sizes: {
            connectOrCreate: data.sizes.map((size: { name: string }) => ({
              where: { name: size.name },
              create: { name: size.name },
            })),
          },
          colors: {
            connectOrCreate: data.colors.map(
              (color: { name: string; code: string }) => ({
                where: { name: color.name },
                create: {
                  name: color.name,
                  code: color.code,
                },
              })
            ),
          },
        },
        include: {
          sizes: true,
          colors: true,
        },
      });

      console.log("제품 생성 성공:", product);
      return Response.json({
        success: true,
        product: {
          id: product.id,
          name: product.name,
        },
      });
    } catch (prismaError) {
      console.error("Prisma 에러:", prismaError);
      throw prismaError;
    }
  } catch (error) {
    console.error("전체 에러:", error);
    if (error instanceof Error) {
      console.error("에러 이름:", error.name);
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
    }

    return Response.json(
      {
        success: false,
        error: "제품 등록 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
