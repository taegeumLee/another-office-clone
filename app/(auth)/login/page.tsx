"use client";

import { Button, Input } from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "로그인에 실패했습니다.");
      }

      // 로그인 성공 시 토큰 저장 및 리다이렉트
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-[400px] p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">ANOTHER OFFICE</h1>
          <h2 className="text-xl text-gray-600 mb-2">로그인</h2>
          <p className="text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="text-black font-medium hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              label="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              classNames={{
                label: "text-sm font-medium text-gray-700",
                input: [
                  "bg-transparent",
                  "text-sm",
                  "placeholder:text-gray-400",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-transparent",
                  "border-gray-300",
                  "hover:border-gray-400",
                  "focus-within:!border-gray-900",
                  "!cursor-text",
                  "transition-colors",
                ],
              }}
            />
            <Input
              type="password"
              label="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              classNames={{
                label: "text-sm font-medium text-gray-700",
                input: [
                  "bg-transparent",
                  "text-sm",
                  "placeholder:text-gray-400",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-transparent",
                  "border-gray-300",
                  "hover:border-gray-400",
                  "focus-within:!border-gray-900",
                  "!cursor-text",
                  "transition-colors",
                ],
              }}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-black text-white font-medium transition-transform hover:scale-[0.98]"
            size="lg"
          >
            로그인
          </Button>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ID / Password를 잊으셨나요?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
