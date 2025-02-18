import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 6자리 인증 코드 생성
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // 기존 인증 코드 삭제
    await prisma.emailVerification.deleteMany({
      where: { email },
    });

    // 새 인증 코드 저장
    await prisma.emailVerification.create({
      data: {
        email,
        code: verificationCode,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30분 후 만료
      },
    });

    // 이메일 발송
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ANOTHER OFFICE 이메일 인증",
      html: `
        <h1>ANOTHER OFFICE 이메일 인증</h1>
        <p>아래의 인증 코드를 입력해주세요:</p>
        <h2>${verificationCode}</h2>
        <p>이 코드는 30분 후에 만료됩니다.</p>
      `,
    });

    return NextResponse.json({ message: "인증 코드가 발송되었습니다." });
  } catch (error) {
    return NextResponse.json(
      { error: "인증 코드 발송에 실패했습니다." },
      { status: 500 }
    );
  }
}
