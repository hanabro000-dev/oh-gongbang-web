import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 한국 시간 기준 오늘 (YYYY-MM-DD)
export function 오늘날짜() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}
