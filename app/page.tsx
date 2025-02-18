import Header from "./components/Header";
import Footer from "./components/Footer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 grid grid-cols-2">
        <div className="relative aspect-[3/2.8] group">
          <Image
            src="/images/main/left-banner.jpg"
            alt="Left banner"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-6 right-6 text-white text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            레거시 울 셋업
          </div>
        </div>
        <div className="relative aspect-[3/2.8] group">
          <Image
            src="/images/main/right-banner.jpg"
            alt="Right banner"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-6 right-6 text-white text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            25SS 1차 판매
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
