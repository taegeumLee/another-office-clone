"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Input,
} from "@nextui-org/react";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
  };

  useEffect(() => {
    checkUser();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div className="relative">
      <Navbar maxWidth="full" className="py-4">
        <NavbarBrand className="basis-[80px]">
          <Link href="/" className="font-bold text-xl">
            <div className="flex flex-col leading-tight relative">
              <span className="relative -bottom-1">ANOTHER</span>
              <span className="relative bottom-1">OFFICE.</span>
            </div>
          </Link>
        </NavbarBrand>

        <NavbarContent className="gap-8 -ml-80" justify="start">
          <NavbarItem>
            <Link href="/new" className="relative group">
              <span className="relative">
                신상품
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all group-hover:w-full"></span>
              </span>
            </Link>
          </NavbarItem>
          <div className="group relative h-full flex items-center">
            <NavbarItem>
              <Button
                variant="light"
                className="p-0 bg-transparent data-[hover=true]:bg-transparent relative group"
              >
                <span className="relative">
                  남성
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all group-hover:w-full"></span>
                </span>
              </Button>
            </NavbarItem>
            <div
              className="hidden group-hover:block fixed left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 py-8 z-50 animate-slideDown"
              style={{ top: "73px" }}
            >
              <div className="max-w-[1200px] mx-auto px-8">
                <div className="grid grid-cols-4 gap-20">
                  <div>
                    <h3 className="font-semibold mb-4">아우터</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li>
                        <Link href="/men/outer" className="hover:text-gray-800">
                          모두보기
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/outer/padding"
                          className="hover:text-gray-800"
                        >
                          패딩다운
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/outer/coat"
                          className="hover:text-gray-800"
                        >
                          코트
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/outer/jacket"
                          className="hover:text-gray-800"
                        >
                          자켓
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">상의</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li>
                        <Link href="/men/top" className="hover:text-gray-800">
                          모두보기
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/top/shirts"
                          className="hover:text-gray-800"
                        >
                          니트웨어
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/top/knit"
                          className="hover:text-gray-800"
                        >
                          셔츠
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/top/tshirts"
                          className="hover:text-gray-800"
                        >
                          티셔츠
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">하의</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li>
                        <Link
                          href="/men/bottom"
                          className="hover:text-gray-800"
                        >
                          모두보기
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/bottom/slacks"
                          className="hover:text-gray-800"
                        >
                          슬랙스
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/bottom/denim"
                          className="hover:text-gray-800"
                        >
                          데님
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/bottom/shorts"
                          className="hover:text-gray-800"
                        >
                          쇼츠
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">악세서리</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li>
                        <Link href="/men/acc" className="hover:text-gray-800">
                          모두보기
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/acc/bag"
                          className="hover:text-gray-800"
                        >
                          가방
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/acc/shoes"
                          className="hover:text-gray-800"
                        >
                          신발
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/men/acc/etc"
                          className="hover:text-gray-800"
                        >
                          기타
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="group relative h-full flex items-center">
            <NavbarItem>
              <Button
                variant="light"
                className="p-0 bg-transparent data-[hover=true]:bg-transparent relative group"
              >
                <span className="relative">
                  여성
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all group-hover:w-full"></span>
                </span>
              </Button>
            </NavbarItem>
            <div
              className="hidden group-hover:block fixed left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 py-8 z-50 animate-slideDown"
              style={{ top: "73px" }}
            >
              <div className="max-w-[1200px] mx-auto px-8">
                <div className="grid grid-cols-4 gap-20">
                  <div>
                    <h3 className="font-semibold mb-4">아우터</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li>
                        <Link
                          href="/women/outer"
                          className="hover:text-gray-800"
                        >
                          모두보기
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/outer/padding"
                          className="hover:text-gray-800"
                        >
                          패딩다운
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/outer/coat"
                          className="hover:text-gray-800"
                        >
                          코트
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/outer/jacket"
                          className="hover:text-gray-800"
                        >
                          자켓
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">상의</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li>
                        <Link href="/women/top" className="hover:text-gray-800">
                          모두보기
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/top/shirts"
                          className="hover:text-gray-800"
                        >
                          니트웨어
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/top/knit"
                          className="hover:text-gray-800"
                        >
                          셔츠
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/top/tshirts"
                          className="hover:text-gray-800"
                        >
                          티셔츠
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">하의</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li>
                        <Link
                          href="/women/bottom"
                          className="hover:text-gray-800"
                        >
                          모두보기
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/bottom/slacks"
                          className="hover:text-gray-800"
                        >
                          슬랙스
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/bottom/denim"
                          className="hover:text-gray-800"
                        >
                          데님
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/bottom/skirt"
                          className="hover:text-gray-800"
                        >
                          스커트
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">악세서리</h3>
                    <ul className="space-y-2 text-gray-500">
                      <li>
                        <Link href="/women/acc" className="hover:text-gray-800">
                          모두보기
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/acc/bag"
                          className="hover:text-gray-800"
                        >
                          가방
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/acc/shoes"
                          className="hover:text-gray-800"
                        >
                          신발
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/women/acc/etc"
                          className="hover:text-gray-800"
                        >
                          기타
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NavbarItem>
            <Link href="/about" className="relative group">
              <span className="relative">
                소개
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all group-hover:w-full"></span>
              </span>
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-4 basis-1/6">
          <NavbarItem>
            <div className="relative flex items-center">
              <div
                className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden ${
                  isSearchExpanded ? "w-[240px]" : "w-8"
                }`}
              >
                <Input
                  classNames={{
                    base: "w-full",
                    mainWrapper: "h-full",
                    input: `text-small ${
                      isSearchExpanded ? "opacity-100" : "opacity-0"
                    }`,
                    inputWrapper: `h-full font-normal text-default-500 transition-all duration-300 rounded-lg ${
                      isSearchExpanded
                        ? "pl-8 pr-3 bg-default-400/20 dark:bg-default-500/20"
                        : "pl-0 pr-0 bg-transparent"
                    }`,
                  }}
                  placeholder="검색어를 입력하세요"
                  size="sm"
                  type="search"
                  onClick={() => setIsSearchExpanded(true)}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      setIsSearchExpanded(false);
                    }
                  }}
                />
                <Button
                  isIconOnly
                  variant="light"
                  className={`absolute ${
                    isSearchExpanded ? "left-1" : "left-0"
                  } transition-all duration-300 p-0 bg-transparent hover:bg-transparent data-[hover=true]:bg-transparent focus:bg-transparent active:bg-transparent data-[pressed=true]:bg-transparent`}
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                >
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </NavbarItem>
          <NavbarItem>
            {user ? (
              <Button
                variant="light"
                className="group relative p-0 h-auto bg-transparent data-[hover=true]:bg-transparent"
                onClick={handleLogout}
              >
                <span className="text-sm text-gray-600 group-hover:opacity-0 transition-opacity duration-200">
                  {user.name}님 환영합니다
                </span>
                <span className="absolute inset-0 flex items-center justify-center text-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  로그아웃
                </span>
              </Button>
            ) : (
              <Button as={Link} href="/login" variant="light">
                로그인
              </Button>
            )}
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} href="/cart" isIconOnly variant="light">
              <ShoppingCartIcon className="w-5 h-5" />
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </div>
  );
}
