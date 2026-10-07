"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 관리자 } from "@/lib/sampleData";

export default function 로그인페이지() {
  const router = useRouter();
  const [아이디, set아이디] = useState("");
  const [비밀번호, set비밀번호] = useState("");
  const [에러, set에러] = useState<string | null>(null);

  function 로그인시도() {
    if (!아이디.trim() || !비밀번호.trim()) {
      set에러("아이디와 비밀번호를 입력해 주세요");
      return;
    }
    if (아이디 !== 관리자.아이디 || 비밀번호 !== 관리자.비밀번호) {
      set에러("아이디 또는 비밀번호가 틀렸습니다");
      return;
    }
    set에러(null);
    router.push("/admin/today");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBFCFD] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#E7ECF1] bg-white p-8 text-center">
        <div className="text-lg font-bold text-[#171D23]">
          오공방 클래스 관리
        </div>
        <div className="mt-1 text-sm text-[#8892A0]">운영자로 로그인</div>

        {에러 && (
          <div className="mt-4 rounded-lg bg-[#C1484B]/10 px-3 py-2 text-sm text-[#C1484B]">
            {에러}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 text-left">
          <div>
            <label className="mb-1 block text-xs text-[#8892A0]">
              아이디
            </label>
            <input
              value={아이디}
              onChange={(e) => set아이디(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && 로그인시도()}
              className="w-full rounded-lg border border-[#E7ECF1] px-3 py-2 text-sm text-[#171D23] outline-none focus:border-[#3E6E96]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#8892A0]">
              비밀번호
            </label>
            <input
              type="password"
              value={비밀번호}
              onChange={(e) => set비밀번호(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && 로그인시도()}
              className="w-full rounded-lg border border-[#E7ECF1] px-3 py-2 text-sm text-[#171D23] outline-none focus:border-[#3E6E96]"
            />
          </div>
        </div>

        <button
          onClick={로그인시도}
          className="mt-5 w-full rounded-lg bg-[#3E6E96] py-2.5 text-sm font-bold text-white"
        >
          로그인
        </button>
      </div>
    </div>
  );
}
