import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const metadata = {
  title: "React Bits Aurora",
  description: "Aurora background demo",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}