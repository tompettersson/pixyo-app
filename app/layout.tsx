import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins, Space_Grotesk, Bebas_Neue, Lora, Oswald, Dancing_Script } from "next/font/google";
import localFont from "next/font/local";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
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

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Local font: Cera Pro (for 1001Frucht and elforyn)
const ceraPro = localFont({
  src: [
    { path: "../public/fonts/CeraPro-Regular.woff", weight: "400", style: "normal" },
    { path: "../public/fonts/CeraPro-Bold.woff", weight: "700", style: "normal" },
  ],
  variable: "--font-cera-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pixyo - KI-Kreativtools für deine Marke",
  description: "Erstelle professionelle Social Media Grafiken und Produktszenen mit KI. Pixyo kombiniert intelligente Bildgenerierung mit einem intuitiven Editor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body
        className={`
          ${inter.variable}
          ${playfair.variable}
          ${poppins.variable}
          ${spaceGrotesk.variable}
          ${bebasNeue.variable}
          ${lora.variable}
          ${oswald.variable}
          ${dancingScript.variable}
          ${ceraPro.variable}
          font-sans antialiased
        `}
      >
        <StackProvider app={stackServerApp} lang="de-DE">
          <StackTheme>
            {children}
            <Toaster
              position="bottom-right"
              theme="dark"
              richColors
            />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
