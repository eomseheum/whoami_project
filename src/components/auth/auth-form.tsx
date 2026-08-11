"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
  initialError?: string;
};

function safeNextPath(path?: string) {
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

function friendlyError(message: string) {
  if (message.includes("Invalid login credentials")) return "이메일 또는 비밀번호를 확인해 주세요.";
  if (message.includes("Email not confirmed")) return "이메일 인증을 먼저 완료해 주세요.";
  if (message.includes("User already registered")) return "이미 가입된 이메일입니다. 로그인해 주세요.";
  if (message.toLowerCase().includes("password")) return "비밀번호는 8자 이상으로 입력해 주세요.";
  return message;
}

function KakaoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 3C6.48 3 2 6.49 2 10.8c0 2.79 1.87 5.24 4.69 6.62l-.95 3.48a.45.45 0 0 0 .69.49l4.15-2.75c.46.05.93.08 1.42.08 5.52 0 10-3.49 10-7.92S17.52 3 12 3Z" />
    </svg>
  );
}

export function AuthForm({ mode, nextPath, initialError }: AuthFormProps) {
  const isSignup = mode === "signup";
  const destination = safeNextPath(nextPath);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (isSignup && password !== passwordConfirm) {
      setError("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (isSignup) {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", destination);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          data: { display_name: displayName.trim() }
        }
      });

      if (signUpError) {
        setError(friendlyError(signUpError.message));
        setLoading(false);
        return;
      }

      if (data.session) {
        window.location.assign(`/auth/complete?next=${encodeURIComponent(destination)}`);
        return;
      }

      setNotice("인증 메일을 보냈습니다. 메일 속 링크를 눌러 가입을 완료해 주세요.");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(friendlyError(loginError.message));
      setLoading(false);
      return;
    }

    window.location.assign(`/auth/complete?next=${encodeURIComponent(destination)}`);
  }

  async function handleKakaoAuth() {
    setError("");
    setNotice("");
    setLoading(true);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", destination);
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: callbackUrl.toString() }
    });

    if (oauthError) {
      setError(friendlyError(oauthError.message));
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-16 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-2xl font-black tracking-tight">
          Profile<span className="text-cyan-300">Hub</span>
        </Link>

        <section className="card p-7 shadow-2xl shadow-slate-950/40 sm:p-9">
          <div className="text-center">
            <p className="text-sm font-semibold text-cyan-300">{isSignup ? "무료로 시작하기" : "다시 만나서 반가워요"}</p>
            <h1 className="mt-2 text-3xl font-black">{isSignup ? "내 프로필 만들기" : "로그인"}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isSignup ? "모든 채널을 하나의 링크로 연결하세요." : "프로필과 링크를 계속 관리해 보세요."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleKakaoAuth}
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 py-3.5 font-bold text-[#191919] transition hover:bg-[#f5dc00] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KakaoIcon />
            {isSignup ? "카카오로 시작하기" : "카카오로 로그인"}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-700/80" />
            또는 이메일로
            <span className="h-px flex-1 bg-slate-700/80" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignup && (
              <label className="block text-sm font-medium text-slate-300">
                이름
                <input
                  required
                  autoComplete="name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
                  placeholder="프로필에 표시할 이름"
                />
              </label>
            )}

            <label className="block text-sm font-medium text-slate-300">
              이메일
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
                placeholder="name@example.com"
              />
            </label>

            <label className="block text-sm font-medium text-slate-300">
              비밀번호
              <input
                required
                minLength={8}
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/10"
                placeholder={isSignup ? "8자 이상 입력" : "비밀번호 입력"}
              />
            </label>

            {isSignup && (
              <>
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
                <label className="flex items-start gap-3 text-xs leading-5 text-slate-400">
                  <input required type="checkbox" className="mt-1 h-4 w-4 accent-cyan-300" />
                  서비스 이용약관 및 개인정보 처리방침에 동의합니다.
                </label>
              </>
            )}

            {error && <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
            {notice && <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm leading-6 text-emerald-300">{notice}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-300 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "처리 중..." : isSignup ? "이메일로 가입하기" : "이메일로 로그인"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {isSignup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"}{" "}
            <Link className="font-semibold text-cyan-300 hover:text-cyan-200" href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "로그인" : "무료 가입"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
