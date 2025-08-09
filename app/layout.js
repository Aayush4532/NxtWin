import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/layout/Header";
import "./globals.css";

export const metadata = {
  title: "NxtWin",
  description: "Probo Hackathon Site",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="dark relative">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
