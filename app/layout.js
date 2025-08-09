// app/layout.js
import "./globals.css";

export const metadata = {
  title: "React Bits Aurora",
  description: "Aurora background demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
