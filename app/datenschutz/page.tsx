import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung - Pixyo',
  description: 'Datenschutzerklärung für Pixyo. Informationen zur Erhebung und Verarbeitung personenbezogener Daten.',
};

export default function DatenschutzPage() {
  return (
    <LegalPageLayout title="Datenschutzerklärung" lastUpdated="14. Februar 2026">
      <h2>1. Datenschutz auf einen Blick</h2>

      <h3>Allgemeine Hinweise</h3>
      <p>
        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
        passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
        persönlich identifiziert werden können.
      </p>

      <h3>Datenerfassung auf dieser Website</h3>
      <p>
        <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
        Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:<br />
        Thomas Pettersson, Am Schwanenberg 1, 65589 Hadamar<br />
        E-Mail: info@pixyo.de
      </p>

      <h2>2. Hosting</h2>
      <p>
        Wir hosten unsere Website bei <strong>Vercel Inc.</strong> (440 N Barranca Ave #4133, Covina, CA 91723, USA).
        Wenn Sie unsere Website besuchen, werden Ihre personenbezogenen Daten auf den Servern von Vercel
        verarbeitet. Hierbei können auch personenbezogene Daten an den Server von Vercel in den USA
        übermittelt werden.
      </p>
      <p>
        Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein
        berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website.
      </p>

      <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>

      <h3>Datenschutz</h3>
      <p>
        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
        personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie
        dieser Datenschutzerklärung.
      </p>

      <h3>Hinweis zur verantwortlichen Stelle</h3>
      <p>
        Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br />
        Thomas Pettersson<br />
        Am Schwanenberg 1<br />
        65589 Hadamar<br />
        Telefon: +49 176 66 88 6945<br />
        E-Mail: info@pixyo.de
      </p>

      <h3>Speicherdauer</h3>
      <p>
        Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben
        Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein
        berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen,
        werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung
        Ihrer personenbezogenen Daten haben.
      </p>

      <h3>Ihre Rechte</h3>
      <p>Sie haben jederzeit das Recht auf:</p>
      <ul>
        <li>Auskunft über Ihre gespeicherten personenbezogenen Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        <li>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
        <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
      </ul>

      <h2>4. Datenerfassung auf dieser Website</h2>

      <h3>Cookies</h3>
      <p>
        Unsere Website verwendet Cookies. Bei Cookies handelt es sich um kleine Textdateien, die Ihr Browser
        automatisch erstellt und auf Ihrem Endgerät speichert, wenn Sie unsere Seite besuchen.
      </p>
      <p>
        Wir verwenden technisch notwendige Cookies, die für den Betrieb der Website erforderlich sind. Diese
        werden nach Ende Ihrer Browser-Sitzung oder nach Ablauf automatisch gelöscht. Darüber hinaus
        speichern wir Ihre Cookie-Einstellungen im Local Storage Ihres Browsers.
      </p>
      <p>
        Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am Betrieb der Website).
      </p>

      <h3>Server-Log-Dateien</h3>
      <p>
        Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
        Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
      </p>
      <ul>
        <li>Browsertyp und Browserversion</li>
        <li>Verwendetes Betriebssystem</li>
        <li>Referrer URL</li>
        <li>Hostname des zugreifenden Rechners</li>
        <li>Uhrzeit der Serveranfrage</li>
        <li>IP-Adresse</li>
      </ul>
      <p>
        Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung
        dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2>5. Registrierung und Nutzerkonto</h2>
      <p>
        Sie können auf unserer Website ein Nutzerkonto anlegen. Dabei erheben wir folgende Daten:
      </p>
      <ul>
        <li>E-Mail-Adresse</li>
        <li>Name (sofern angegeben)</li>
      </ul>
      <p>
        Die Registrierung erfolgt über den Authentifizierungsdienst <strong>Stack Auth</strong>. Die Daten werden
        für die Bereitstellung unserer Dienste und die Verwaltung Ihres Nutzerkontos verwendet.
      </p>
      <p>
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
      </p>

      <h2>6. KI-gestützte Dienste</h2>
      <p>
        Pixyo nutzt KI-Dienste zur Bildgenerierung und Textverarbeitung. Dabei werden folgende
        Drittanbieter eingesetzt:
      </p>

      <h3>Google Gemini / Vertex AI</h3>
      <p>
        Für die Bildgenerierung verwenden wir die Google Gemini API und optional Google Vertex AI.
        Dabei werden Ihre Eingaben (Prompts, hochgeladene Produktbilder) an Google-Server übermittelt.
        Google verarbeitet diese Daten gemäß der{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google Datenschutzerklärung
        </a>.
      </p>

      <h3>Anthropic Claude</h3>
      <p>
        Für die Textgenerierung und Prompt-Optimierung verwenden wir die Anthropic Claude API.
        Dabei werden Ihre Eingaben an Anthropic-Server in den USA übermittelt. Anthropic verarbeitet
        diese Daten gemäß der{' '}
        <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">
          Anthropic Datenschutzerklärung
        </a>.
      </p>
      <p>
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. a DSGVO
        (Einwilligung durch Nutzung der KI-Funktionen).
      </p>

      <h2>7. Speicherung von Dateien</h2>
      <p>
        Hochgeladene und generierte Bilder werden über <strong>Vercel Blob Storage</strong> gespeichert.
        Die Daten werden auf Servern von Vercel verarbeitet, die sich in den USA befinden können.
      </p>

      <h2>8. Datenbank</h2>
      <p>
        Ihre Nutzerdaten und Konfigurationen werden in einer <strong>Vercel Postgres</strong>-Datenbank
        (betrieben durch Neon) gespeichert. Die Datenverarbeitung erfolgt auf Grundlage von
        Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
      </p>

      <h2>9. Datenübermittlung in Drittländer</h2>
      <p>
        Einige der genannten Dienste (Vercel, Google, Anthropic) verarbeiten Daten in den USA. Die
        Übermittlung erfolgt auf Grundlage von Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO)
        bzw. eines Angemessenheitsbeschlusses der EU-Kommission (EU-US Data Privacy Framework).
      </p>

      <h2>10. Änderung dieser Datenschutzerklärung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
        rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der
        Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue
        Datenschutzerklärung.
      </p>
    </LegalPageLayout>
  );
}
