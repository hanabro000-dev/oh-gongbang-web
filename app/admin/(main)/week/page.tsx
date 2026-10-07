"use client";

import { useEffect, useState } from "react";
import { supabase, 오늘날짜 } from "@/lib/supabase";

type 클래스 = { id: number; class_date: string; class_time: string; title: string };

const 요일이름 = ["월", "화", "수", "목", "금", "토", "일"];

function 날짜더하기(날짜: string, 일수: number) {
  const d = new Date(날짜 + "T00:00:00");
  d.setDate(d.getDate() + 일수);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// 이번 주 월요일 (한국 시간 기준)
function 이번주월요일(오늘: string) {
  const d = new Date(오늘 + "T00:00:00");
  const 월요일까지 = (d.getDay() + 6) % 7; // 월=0 … 일=6
  return 날짜더하기(오늘, -월요일까지);
}

// PRD 3-4 주간 — 시간 × 요일 표 (이번 주만)
export default function 주간페이지() {
  const 오늘 = 오늘날짜();
  const 월요일 = 이번주월요일(오늘);
  const 날짜들 = 요일이름.map((_, i) => 날짜더하기(월요일, i));

  const [목록, set목록] = useState<클래스[] | null>(null);
  const [오류, set오류] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("classes")
      .select("id, class_date, class_time, title")
      .gte("class_date", 날짜들[0])
      .lte("class_date", 날짜들[6])
      .order("class_time")
      .then(({ data, error }) => {
        if (error) set오류("불러오지 못했습니다");
        else set목록(data as 클래스[]);
      });
  }, [날짜들[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  // 표의 가로줄 = 이번 주에 클래스가 있는 시각들
  const 시각들 = Array.from(
    new Set((목록 ?? []).map((c) => c.class_time.slice(0, 5)))
  ).sort();

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-bold text-[#171D23]">
          이번 주 — {날짜들[0].slice(5).replace("-", "/")} ~{" "}
          {날짜들[6].slice(5).replace("-", "/")}
        </h1>

        {오류 && (
          <div className="mt-5 rounded-xl bg-[#C1484B]/10 px-4 py-2.5 text-sm text-[#C1484B]">
            {오류}
          </div>
        )}

        {목록 === null && !오류 && (
          <div className="mt-5 h-40 animate-pulse rounded-2xl bg-[#E7ECF1]" />
        )}

        {목록 !== null && 목록.length === 0 && (
          <div className="mt-5 rounded-2xl border border-[#E7ECF1] bg-white px-4 py-10 text-center text-sm text-[#8892A0]">
            이번 주엔 열리는 클래스가 없습니다
          </div>
        )}

        {목록 !== null && 목록.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-[#E7ECF1] bg-white">
            <table className="w-full border-collapse text-center text-sm">
              <thead>
                <tr>
                  <th className="w-16 border-b border-[#E7ECF1] py-3" />
                  {요일이름.map((요일, i) => (
                    <th
                      key={요일}
                      className={`border-b border-l border-[#E7ECF1] py-3 font-semibold ${
                        날짜들[i] === 오늘 ? "text-[#3E6E96]" : "text-[#171D23]"
                      }`}
                    >
                      {요일}
                      <div className="text-xs font-normal text-[#8892A0]">
                        {Number(날짜들[i].slice(8))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {시각들.map((시각) => (
                  <tr key={시각}>
                    <td className="border-b border-[#E7ECF1] py-3 text-[#8892A0]">
                      {시각.slice(0, 2)}시
                    </td>
                    {날짜들.map((날짜) => {
                      const 칸 = 목록.filter(
                        (c) =>
                          c.class_date === 날짜 &&
                          c.class_time.slice(0, 5) === 시각
                      );
                      return (
                        <td
                          key={날짜}
                          className="h-14 border-b border-l border-[#E7ECF1] p-1 align-middle"
                        >
                          {칸.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-md bg-[#3E6E96] px-1 py-1.5 text-xs font-bold text-white"
                              title={c.title}
                            >
                              {c.title.slice(0, 2)}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
