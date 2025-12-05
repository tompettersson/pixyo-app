import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins, Space_Grotesk, Bebas_Neue, Lora, Oswald } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

// Load all fonts needed for the editor
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixyo - AI Social Image Generator",
  description: "Create stunning social media images with AI-powered generation and a powerful editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${inter.variable} 
          ${playfair.variable} 
          ${poppins.variable} 
          ${spaceGrotesk.variable}
          ${bebasNeue.variable}
          ${lora.variable}
          ${oswald.variable}
          font-sans antialiased
        `}
      >
        {children}
        <Toaster 
          position="bottom-right"
          theme="dark"
          richColors
        />
      </body>
    </html>
  );
}
