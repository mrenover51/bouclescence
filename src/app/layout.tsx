import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import "./globals.css";
import { absoluteUrl, getSiteUrl, jsonLd } from "@/lib/seo";
import { ShippingProvider } from "@/components/shop/shipping-provider";
import { getShippingSettings } from "@/lib/shipping-settings";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: "Bouclescence | Boucles d’oreilles et bijoux de créatrice", template: "%s | Bouclescence" },
  description: "Découvrez l’univers Bouclescence et ses boucles d’oreilles féminines, originales et délicates, proposées en petites séries.",
  applicationName: "Bouclescence",
  openGraph: { siteName:"Bouclescence",locale:"fr_FR",type:"website",url:"/" },
  robots: { index:true,follow:true },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const shippingSettings = await getShippingSettings();
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":`${absoluteUrl("/")}#organization`,name:"Bouclescence",url:absoluteUrl("/")},{"@type":"WebSite","@id":`${absoluteUrl("/")}#website`,name:"Bouclescence",url:absoluteUrl("/"),inLanguage:"fr-FR",publisher:{"@id":`${absoluteUrl("/")}#organization`}}]})}} />
        <a className="skip-link" href="#contenu">Aller au contenu</a>
        <ShippingProvider settings={shippingSettings}>
          <Header />
          <main id="contenu">{children}</main>
        </ShippingProvider>
        <Footer />
      </body>
    </html>
  );
}
