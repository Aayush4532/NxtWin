import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const metadata = {
  title: "NxtWin",
  description: "Aurora background demo",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className='dark'>{children}</body>
      </html>
    </ClerkProvider>
  );
} 