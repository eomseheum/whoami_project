import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ProfileHub", template: "%s | ProfileHub" },
  description: "YouTube, Instagram, TikTok 링크를 한 곳에 모으는 크리에이터 프로필"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
