"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type OnboardingFormProps = {
  email: string | null;
  initialDisplayName: string;
  nextPath: string;
};

export function OnboardingForm({ email, initialDisplayName, nextPath }: OnboardingFormProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function completeSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setError("아이디는 영문 소문자, 숫자, 밑줄만 사용해 3~30자로 입력해 주세요.");
      return;
    }
    if (!displayName.trim()) {
      setError("표시 이름을 입력해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username, display_name: displayName.trim() })
      .eq("user_id", user.id);

    if (profileError) {
      setError(profileError.code === "23505" ? "이미 사용 중인 아이디입니다." : "프로필을 저장하지 못했습니다. 다시 시도해 주세요.");
      setLoading(false);
      return;
    }

    const userData = {
      onboarding_completed: true,
      display_name: displayName.trim()
    };
    const { error: updateError } = await supabase.auth.updateUser(
      email ? { password, data: userData } : { data: userData }
    );

    if (updateError) {
      setError(updateError.message.toLowerCase().includes("password")
        ? "비밀번호는 8자 이상이며 추측하기 어렵게 설정해 주세요."
        : "계정 설정을 완료하지 못했습니다. 다시 시도해 주세요.");
      setLoading(false);
      return;
    }

    window.location.assign(nextPath);
  }

  return (
    <form onSubmit={completeSignup} className="mt-7 space-y-4">
      <label className="block text-sm font-medium text-slate-300">
        카카오 계정 이메일
        <input
          readOnly
          value={email ?? "카카오에서 이메일을 제공하지 않았습니다"}
          className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-500 outline-none"
        />
      </label>

      <label className="block text-sm font-medium text-slate-300">
        서비스 아이디
        <input
          required
          minLength={3}
          maxLength={30}
          pattern="[a-z0-9_]+"
          autoCapitalize="none"
          autoCorrect="off"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
          placeholder="예: creator_name"
        />
        <span className="mt-1.5 block text-xs font-normal text-slate-500">공개 주소 /u/아이디에 사용됩니다.</span>
      </label>

      <label className="block text-sm font-medium text-slate-300">
        표시 이름
        <input
          required
          maxLength={50}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
          placeholder="프로필에 표시할 이름"
        />
      </label>

      {email ? (
        <>
          <label className="block text-sm font-medium text-slate-300">
            비밀번호
            <input
              required
              minLength={8}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
              placeholder="8자 이상 입력"
            />
            <span className="mt-1.5 block text-xs font-normal text-slate-500">나중에 이메일로도 로그인할 때 사용합니다.</span>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            비밀번호 확인
            <input
              required
              minLength={8}
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
              placeholder="비밀번호 다시 입력"
            />
          </label>
        </>
      ) : null}

      <label className="flex items-start gap-3 text-xs leading-5 text-slate-400">
        <input required type="checkbox" className="mt-1 h-4 w-4 accent-cyan-300" />
        서비스 이용약관 및 개인정보 처리방침에 동의합니다.
      </label>

      {error && <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm leading-6 text-rose-300">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-cyan-300 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "가입 처리 중..." : "가입 완료하고 시작하기"}
      </button>
    </form>
  );
}
