"use client";

import { Button, Input } from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setError("");
    setIsEmailValid(validateEmail(newEmail));
  };

  const sendVerificationEmail = async () => {
    if (!validateEmail(email)) {
      setError("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    try {
      setError("");
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setIsEmailSent(true);
      setError("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const verifyCode = async () => {
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setIsVerified(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordConfirm && e.target.value !== passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handlePasswordConfirmChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordConfirm(e.target.value);
    if (password !== e.target.value) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isVerified) {
      setError("이메일 인증이 필요합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          birthDate,
          phone,
          address,
          detailAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      // 회원가입 성공 시 토큰 저장
      localStorage.setItem("token", data.token);

      // 홈페이지로 리다이렉트
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
          <h2 className="text-xl text-gray-600 mb-2">회원가입</h2>
          <p className="text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="text-black font-medium hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="text"
              label="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              type="date"
              label="생년월일"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              min="1900-01-01"
              max={new Date().toISOString().split("T")[0]}
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
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  label="이메일"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={isEmailSent && isVerified}
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
                <Button
                  type="button"
                  onClick={sendVerificationEmail}
                  disabled={!isEmailValid || (isEmailSent && isVerified)}
                  className={`${
                    !isEmailValid || (isEmailSent && !isVerified)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-900"
                  } text-white min-w-[120px]`}
                >
                  {isEmailSent && !isVerified ? "재발송" : "인증번호 발송"}
                </Button>
              </div>

              {isEmailSent && (
                <div
                  className={`flex gap-2 transition-all duration-300 ${
                    isEmailSent ? "opacity-100" : "opacity-0 h-0"
                  }`}
                >
                  <Input
                    type="text"
                    label="인증번호"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    disabled={isVerified}
                    placeholder="6자리 인증번호를 입력하세요"
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
                  <Button
                    type="button"
                    onClick={verifyCode}
                    disabled={isVerified}
                    className={`${
                      isVerified ? "bg-green-600" : "bg-gray-900"
                    } text-white min-w-[120px]`}
                  >
                    {isVerified ? "인증완료" : "확인"}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                label="비밀번호"
                value={password}
                onChange={handlePasswordChange}
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
                label="비밀번호 확인"
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
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
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>

            <Input
              type="tel"
              label="전화번호"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
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
              type="text"
              label="주소"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="기본 주소"
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
              type="text"
              label="상세 주소"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="상세 주소"
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
            <p
              className={`text-sm text-center font-medium ${
                error.includes("발송되었습니다")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-black text-white font-medium transition-transform hover:scale-[0.98]"
            size="lg"
            disabled={!isVerified || Boolean(passwordError)}
          >
            회원가입
          </Button>
        </form>
      </div>
    </div>
  );
}
