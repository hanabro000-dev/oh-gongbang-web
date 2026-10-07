"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type 대기신청 = {
  id: number;
  created_at: string;
  students: { name: string; phone: string };
  classes: { class_date: string; class_time: string; title: string };
};

function 짧은날짜(날짜: string) {
  const d = new Date(날짜 + "T00:00:00");
  const 요일 = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${요일})`;
}

// 010-1234-5678 → 010-••••-5678 (가운데 4자리 가림)
function 번호가리기(번호: string) {
  const 숫자 = 번호.replace(/\D/g, "");
  if (숫자.length < 8) return 번호;
  return `${숫자.slice(0, 3)}-••••-${숫자.slice(-4)}`;
}

// PRD 3-3 받은 신청
export default function 받은신청페이지() {
  const [목록, set목록] = useState<대기신청[] | null>(null);
  const [오류, set오류] = useState<string | null>(null);
  const [처리중, set처리중] = useState<number | null>(null);

  const 불러오기 = useCallback(async () => {
    set오류(null);
    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, created_at, students(name, phone), classes(class_date, class_time, title)"
      )
      .eq("status", "확인중")
      .order("created_at");
    if (error) {
      set오류("불러오지 못했습니다");
      return;
    }
    set목록(data as unknown as 대기신청[]);
  }, []);

  useEffect(() => {
    불러오기();
  }, [불러오기]);

  async function 처리하기(id: number, 새상태: "확정" | "거절") {
    set처리중(id);
    const { error } = await supabase
      .from("applications")
      .update({ status: 새상태 })
      .eq("id", id);
    set처리중(null);
    if (error) {
      set오류("처리하지 못했습니다");
      return;
    }
    await 불러오기();
    window.dispatchEvent(new Event("applications-changed")); // 상단 탭의 대기 숫자도 다시 센다
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-bold text-[#171D23]">
          받은 신청 ({목록?.length ?? 0}건)
        </h1>

        {오류 && (
          <div className="mt-5 flex items-center rounded-xl bg-[#C1484B]/10 px-4 py-2.5 text-sm text-[#C1484B]">
            {오류}
            <button onClick={불러오기} className="ml-auto font-bold underline">
              다시 시도
            </button>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3">
          {목록 === null && !오류 && (
            <>
              <div className="h-20 animate-pulse rounded-2xl bg-[#E7ECF1]" />
              <div className="h-20 animate-pulse rounded-2xl bg-[#E7ECF1]" />
            </>
          )}

          {(목록 ?? []).map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 rounded-2xl border border-[#E7ECF1] bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-semibold text-[#171D23]">
                    {a.students.name}
                  </span>
                  <span className="text-sm text-[#8892A0]">
                    {번호가리기(a.students.phone)}
                  </span>
                </div>
                <div className="mt-0.5 text-sm text-[#171D23]">
                  {짧은날짜(a.classes.class_date)}{" "}
                  {a.classes.class_time.slice(0, 5)} {a.classes.title}
                </div>
              </div>
              <button
                disabled={처리중 === a.id}
                onClick={() => 처리하기(a.id, "확정")}
                className="rounded-lg bg-[#3E6E96] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                승인
              </button>
              <button
                disabled={처리중 === a.id}
                onClick={() => 처리하기(a.id, "거절")}
                className="rounded-lg border border-[#E7ECF1] bg-white px-4 py-2 text-sm font-bold text-[#171D23] disabled:opacity-50"
              >
                거절
              </button>
            </div>
          ))}

          {목록 !== null && 목록.length === 0 && (
            <div className="rounded-2xl border border-[#E7ECF1] bg-white px-4 py-10 text-center text-sm text-[#8892A0]">
              대기중인 신청이 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
