"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, [pathname]); // pathname이 변경될 때마다 사용자 정보 확인

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            ANOTHER OFFICE
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {user.name}님 환영합니다
                </span>
                <Button
                  onClick={handleLogout}
                  className="bg-black text-white"
                  size="sm"
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-black text-white" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="bg-white text-black border-gray-200 border"
                    size="sm"
                  >
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
