"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, 오늘날짜 } from "@/lib/supabase";

type 신청상태 = "확인중" | "확정" | "거절" | "취소";

type 신청 = {
  id: number;
  status: 신청상태;
  students: { id: number; name: string; phone: string };
};

type 클래스 = {
  id: number;
  class_date: string;
  class_time: string;
  title: string;
  capacity: number;
  applications: 신청[];
};

type 신청기록 = {
  날짜: string;
  시간: string;
  클래스이름: string;
  상태: 신청상태;
};

function 날짜표시(날짜: string) {
  const d = new Date(날짜 + "T00:00:00");
  const 요일 = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${요일})`;
}

function 짧은날짜(날짜: string) {
  const d = new Date(날짜 + "T00:00:00");
  const 요일 = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}(${요일})`;
}

const 살아있는상태 = (상태: 신청상태) => 상태 === "확정" || 상태 === "확인중";

export default function 오늘클래스페이지() {
  const 오늘 = 오늘날짜();

  const [클래스목록, set클래스목록] = useState<클래스[] | null>(null);
  const [오류, set오류] = useState<string | null>(null);
  const [검색어, set검색어] = useState("");
  const [선택한수강생, set선택한수강생] = useState<{
    id: number;
    name: string;
    phone: string;
  } | null>(null);
  const [상세기록, set상세기록] = useState<신청기록[] | null>(null);

  const 불러오기 = useCallback(async () => {
    set오류(null);
    const { data, error } = await supabase
      .from("classes")
      .select(
        "id, class_date, class_time, title, capacity, applications(id, status, students(id, name, phone))"
      )
      .eq("class_date", 오늘)
      .order("class_time");
    if (error) {
      set오류("불러오지 못했습니다");
      return;
    }
    set클래스목록(data as unknown as 클래스[]);
  }, [오늘]);

  useEffect(() => {
    불러오기();
  }, [불러오기]);

  useEffect(() => {
    if (!선택한수강생) {
      set상세기록(null);
      return;
    }
    supabase
      .from("applications")
      .select("status, classes(class_date, class_time, title)")
      .eq("student_id", 선택한수강생.id)
      .then(({ data }) => {
        const 기록 = (
          (data ?? []) as unknown as {
            status: 신청상태;
            classes: { class_date: string; class_time: string; title: string };
          }[]
        )
          .map((r) => ({
            날짜: r.classes.class_date,
            시간: r.classes.class_time.slice(0, 5),
            클래스이름: r.classes.title,
            상태: r.status,
          }))
          .sort((a, b) => (a.날짜 + a.시간 < b.날짜 + b.시간 ? 1 : -1));
        set상세기록(기록);
      });
  }, [선택한수강생]);

  const 오늘클래스 = (클래스목록 ?? []).map((c) => ({
    ...c,
    applications: c.applications.filter((a) => 살아있는상태(a.status)),
  }));

  const 필터된클래스 = 검색어.trim()
    ? 오늘클래스
        .map((c) => ({
          ...c,
          applications: c.applications.filter((a) =>
            a.students.name.includes(검색어.trim())
          ),
        }))
        .filter((c) => c.applications.length > 0)
    : 오늘클래스;

  return (
    <div>
      <div className="px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#171D23]">
              오늘 클래스 — {날짜표시(오늘)}
            </h1>
            <input
              value={검색어}
              onChange={(e) => set검색어(e.target.value)}
              placeholder="이름 검색"
              className="ml-auto rounded-lg border border-[#E7ECF1] bg-white px-3 py-1.5 text-sm text-[#171D23] outline-none placeholder:text-[#8892A0] focus:border-[#3E6E96]"
            />
          </div>

          {오류 && (
            <div className="mt-5 flex items-center rounded-xl bg-[#C1484B]/10 px-4 py-2.5 text-sm text-[#C1484B]">
              {오류}
              <button onClick={불러오기} className="ml-auto font-bold underline">
                다시 시도
              </button>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3">
            {클래스목록 === null && !오류 && (
              <>
                <div className="h-24 animate-pulse rounded-2xl bg-[#E7ECF1]" />
                <div className="h-24 animate-pulse rounded-2xl bg-[#E7ECF1]" />
              </>
            )}

            {필터된클래스.map((c) => {
              const 원본 = 오늘클래스.find((o) => o.id === c.id)!;
              const 신청수 = 원본.applications.length;
              const 마감 = 신청수 >= c.capacity;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-[#E7ECF1] bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#171D23]">
                      {c.class_time.slice(0, 5)} {c.title}
                    </span>
                    <div className="ml-auto flex items-baseline gap-1">
                      <span
                        className={`text-[32px] font-extrabold leading-none ${
                          마감 ? "text-[#5B6472]" : "text-[#3E6E96]"
                        }`}
                      >
                        {신청수}
                      </span>
                      <span className="text-sm text-[#8892A0]">
                        /{c.capacity}
                      </span>
                      {마감 && (
                        <span className="text-xs font-bold text-[#5B6472]">
                          마감
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.applications.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => set선택한수강생(a.students)}
                        className="rounded-full border border-[#E7ECF1] px-3.5 py-1.5 text-sm text-[#171D23] hover:border-[#3E6E96] hover:bg-[#3E6E96]/5"
                      >
                        {a.status === "확정" ? (
                          <span className="text-[#2F8F5D]">✓</span>
                        ) : null}{" "}
                        {a.students.name}
                        {a.status === "확인중" ? (
                          <span className="text-[#C9A227]"> (확인중)</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {클래스목록 !== null &&
              필터된클래스.length === 0 &&
              오늘클래스.length > 0 && (
                <div className="rounded-2xl border border-[#E7ECF1] bg-white px-4 py-10 text-center text-sm text-[#8892A0]">
                  찾는 분이 없습니다
                </div>
              )}

            {클래스목록 !== null && 오늘클래스.length === 0 && (
              <div className="rounded-2xl border border-[#E7ECF1] bg-white px-4 py-10 text-center text-sm text-[#8892A0]">
                오늘은 열리는 클래스가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3-11. 수강생 자세히 보기 */}
      {선택한수강생 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => set선택한수강생(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center">
              <span className="text-sm font-semibold text-[#8892A0]">
                수강생 정보
              </span>
              <button
                onClick={() => set선택한수강생(null)}
                className="ml-auto text-lg text-[#8892A0] hover:text-[#171D23]"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 border-b border-[#E7ECF1] pb-4">
              <div className="text-lg font-bold text-[#171D23]">
                {선택한수강생.name}
              </div>
              <div className="mt-1 text-sm text-[#8892A0]">
                {선택한수강생.phone}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-bold text-[#8892A0]">
                신청 기록
              </div>
              <div className="flex flex-col gap-2">
                {상세기록 === null && (
                  <div className="h-10 animate-pulse rounded-lg bg-[#E7ECF1]" />
                )}
                {(상세기록 ?? []).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-[#E7ECF1] px-3 py-2 text-sm"
                  >
                    <span className="text-[#8892A0]">
                      {짧은날짜(r.날짜)} {r.시간}
                    </span>
                    <span className="text-[#171D23]">{r.클래스이름}</span>
                    <span
                      className={`ml-auto text-xs font-bold ${
                        r.상태 === "확정"
                          ? "text-[#2F8F5D]"
                          : r.상태 === "확인중"
                          ? "text-[#C9A227]"
                          : "text-[#C1484B]"
                      }`}
                    >
                      {r.상태}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
