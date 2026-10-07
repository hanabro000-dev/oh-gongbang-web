"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type 공지 = { id: number; title: string; body: string; posted_on: string };

function 날짜표시(날짜: string) {
  const d = new Date(날짜 + "T00:00:00");
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// PRD 3-5 알림판 — 글 목록 + 새 공지 (수정·삭제는 오늘 안 만든다)
export default function 알림판페이지() {
  const [목록, set목록] = useState<공지[] | null>(null);
  const [오류, set오류] = useState<string | null>(null);
  const [펼친것, set펼친것] = useState<number | null>(null);
  const [작성중, set작성중] = useState(false);
  const [제목, set제목] = useState("");
  const [내용, set내용] = useState("");
  const [폼오류, set폼오류] = useState<string | null>(null);
  const [올리는중, set올리는중] = useState(false);

  const 불러오기 = useCallback(async () => {
    set오류(null);
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, body, posted_on")
      .order("posted_on", { ascending: false })
      .order("id", { ascending: false });
    if (error) {
      set오류("불러오지 못했습니다");
      return;
    }
    set목록(data as 공지[]);
  }, []);

  useEffect(() => {
    불러오기();
  }, [불러오기]);

  async function 올리기() {
    if (!제목.trim() || !내용.trim()) {
      set폼오류("제목과 내용을 입력해 주세요");
      return;
    }
    set올리는중(true);
    set폼오류(null);
    const { error } = await supabase
      .from("notices")
      .insert({ title: 제목.trim(), body: 내용.trim() });
    set올리는중(false);
    if (error) {
      set폼오류("올리지 못했습니다. 다시 시도해 주세요");
      return;
    }
    set제목("");
    set내용("");
    set작성중(false);
    await 불러오기();
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-[#171D23]">알림판</h1>
          <button
            onClick={() => set작성중(!작성중)}
            className="ml-auto rounded-lg bg-[#3E6E96] px-4 py-2 text-sm font-bold text-white"
          >
            {작성중 ? "닫기" : "새 공지"}
          </button>
        </div>

        {작성중 && (
          <div className="mt-5 rounded-2xl border border-[#E7ECF1] bg-white p-4">
            <input
              value={제목}
              onChange={(e) => set제목(e.target.value)}
              placeholder="제목"
              className="w-full rounded-lg border border-[#E7ECF1] px-3 py-2 text-sm text-[#171D23] outline-none focus:border-[#3E6E96]"
            />
            <textarea
              value={내용}
              onChange={(e) => set내용(e.target.value)}
              placeholder="내용"
              rows={4}
              className="mt-3 w-full rounded-lg border border-[#E7ECF1] px-3 py-2 text-sm text-[#171D23] outline-none focus:border-[#3E6E96]"
            />
            {폼오류 && (
              <div className="mt-2 text-sm font-semibold text-[#C1484B]">
                {폼오류}
              </div>
            )}
            <button
              onClick={올리기}
              disabled={올리는중}
              className="mt-3 rounded-lg bg-[#3E6E96] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {올리는중 ? "올리는 중…" : "올리기"}
            </button>
          </div>
        )}

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
              <div className="h-16 animate-pulse rounded-2xl bg-[#E7ECF1]" />
              <div className="h-16 animate-pulse rounded-2xl bg-[#E7ECF1]" />
            </>
          )}

          {(목록 ?? []).map((n) => (
            <button
              key={n.id}
              onClick={() => set펼친것(펼친것 === n.id ? null : n.id)}
              className="rounded-2xl border border-[#E7ECF1] bg-white px-4 py-3 text-left"
            >
              <div className="font-semibold text-[#171D23]">{n.title}</div>
              <div className="mt-0.5 text-xs text-[#8892A0]">
                {날짜표시(n.posted_on)}
              </div>
              {펼친것 === n.id && (
                <div className="mt-3 whitespace-pre-wrap border-t border-[#E7ECF1] pt-3 text-sm text-[#171D23]">
                  {n.body}
                </div>
              )}
            </button>
          ))}

          {목록 !== null && 목록.length === 0 && (
            <div className="rounded-2xl border border-[#E7ECF1] bg-white px-4 py-10 text-center text-sm text-[#8892A0]">
              올린 공지가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
