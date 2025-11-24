import type { Metadata } from "next";
import "./globals.css"; // <--- 关键就是这一行！没有它，Tailwind 就是废铁。
import NavBar from '@/components/NavBar' 
import { ProfileProvider } from '@/context/ProfileContext'

export const metadata: Metadata = {
  title: "Ourbowl",
  description: "记录情绪，抚摸灵魂",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <ProfileProvider> {/* 包裹住整个应用 */}
           <NavBar />
           <div className="pt-20 md:pt-24">
             {children}
           </div>
        </ProfileProvider>
      </body>
    </html>
  );
}