import { redirect } from "next/navigation";

// PRD 3-1 — 웹 주소 맨 앞은 로그인 화면으로 보낸다
export default function 첫화면() {
  redirect("/admin/login");
}
