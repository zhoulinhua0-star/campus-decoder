import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Decoder — Practice the rules no one teaches",
  description:
    "A cross-cultural campus communication coach for international students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
