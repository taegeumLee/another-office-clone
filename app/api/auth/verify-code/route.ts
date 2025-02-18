import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "인증 정보를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "인증 코드가 만료되었습니다." },
        { status: 400 }
      );
    }

    if (verification.code !== code) {
      return NextResponse.json(
        { error: "잘못된 인증 코드입니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    return NextResponse.json(
      { error: "인증에 실패했습니다." },
      { status: 500 }
    );
  }
}
