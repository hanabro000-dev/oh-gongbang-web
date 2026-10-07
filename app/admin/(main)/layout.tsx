"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const 탭 = [
  { 이름: "오늘", 주소: "/admin/today" },
  { 이름: "받은 신청", 주소: "/admin/requests" },
  { 이름: "주간", 주소: "/admin/week" },
  { 이름: "알림판", 주소: "/admin/notice" },
];

// PRD 3.0 「웹 상단 바」 — 로그인 뒤 모든 웹 화면 맨 위
export default function 관리자레이아웃({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [대기수, set대기수] = useState(0);

  // 화면을 옮길 때, 그리고 신청이 바뀔 때마다 대기중 신청 수를 다시 센다
  useEffect(() => {
    const 세기 = () =>
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "확인중")
        .then(({ count }) => set대기수(count ?? 0));
    세기();
    window.addEventListener("applications-changed", 세기);
    return () => window.removeEventListener("applications-changed", 세기);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#FBFCFD]">
      <div className="flex items-center gap-6 border-b border-[#E7ECF1] bg-white px-6">
        <span className="py-3 text-sm font-semibold text-[#171D23]">
          오공방 클래스 관리
        </span>
        <nav className="flex gap-1">
          {탭.map((t) => {
            const 켜짐 = pathname === t.주소;
            return (
              <Link
                key={t.주소}
                href={t.주소}
                className={`px-3 py-3 text-sm font-semibold border-b-2 ${
                  켜짐
                    ? "border-[#3E6E96] text-[#3E6E96]"
                    : "border-transparent text-[#8892A0] hover:text-[#171D23]"
                }`}
              >
                {t.이름}
                {t.이름 === "받은 신청" && 대기수 > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#C9A227] px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {대기수}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => router.push("/admin/login")}
          className="ml-auto text-sm text-[#8892A0] hover:text-[#171D23]"
        >
          로그아웃
        </button>
      </div>
      {children}
    </div>
  );
}
