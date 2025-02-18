import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-4 px-6 border-t">
      <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
        <Link href="/terms" className="hover:text-gray-900">
          이용약관
        </Link>
        <Link href="/membership" className="hover:text-gray-900">
          멤버십
        </Link>
        <Link href="/shipping" className="hover:text-gray-900">
          배송&반품
        </Link>
        <Link href="/notice" className="hover:text-gray-900">
          공지
        </Link>
        <Link href="/orders" className="hover:text-gray-900">
          주문조회
        </Link>
        <Link
          href="https://instagram.com"
          target="_blank"
          className="hover:text-gray-900"
        >
          인스타그램
        </Link>
      </div>
    </footer>
  );
}
