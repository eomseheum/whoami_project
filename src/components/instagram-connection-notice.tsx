"use client";

import { useSearchParams } from "next/navigation";

const messages: Record<string, { title: string; detail: string }> = {
  connected: { title: "Instagram 피드를 연결했습니다.", detail: "최신 게시물이 프로필과 추천 게시물에 표시됩니다." },
  professional_account_required: { title: "프로페셔널 계정만 연결할 수 있습니다.", detail: "Instagram 앱에서 설정 및 활동 → 계정 유형 및 도구 → 프로페셔널 계정으로 전환한 뒤 다시 시도해 주세요." },
  account_failed: { title: "Instagram 계정 정보를 확인하지 못했습니다.", detail: "프로페셔널 계정인지 확인한 뒤 다시 시도해 주세요." },
  authorization_failed: { title: "Instagram 연동 권한을 확인하지 못했습니다.", detail: "연동을 다시 시도해 주세요." },
  configuration_error: { title: "Instagram 연동 설정이 완료되지 않았습니다.", detail: "관리자에게 환경 변수 설정을 요청해 주세요." },
  save_failed: { title: "Instagram 연동 정보를 저장하지 못했습니다.", detail: "잠시 후 다시 시도해 주세요." }
};

export function InstagramConnectionNotice() {
  const status = useSearchParams().get("instagram");
  const message = status ? messages[status] : null;
  if (!message) return null;
  const isError = status !== "connected";
  return <div role="status" className={`rounded-xl border p-4 text-sm ${isError ? "border-rose-500/40 bg-rose-500/10 text-rose-100" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"}`}><p className="font-bold">{message.title}</p><p className="mt-1 opacity-90">{message.detail}</p></div>;
}
