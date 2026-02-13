import { Metadata } from 'next';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'AGB - Pixyo',
  description: 'Allgemeine Geschäftsbedingungen für die Nutzung von Pixyo.',
};

export default function AGBPage() {
  return (
    <LegalPageLayout title="Allgemeine Geschäftsbedingungen" lastUpdated="14. Februar 2026">
      <h2>§ 1 Geltungsbereich</h2>
      <p>
        (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend &quot;AGB&quot;) gelten für die Nutzung der
        webbasierten Anwendung &quot;Pixyo&quot; (nachfolgend &quot;Dienst&quot;), betrieben von Thomas Pettersson,
        Am Schwanenberg 1, 65589 Hadamar (nachfolgend &quot;Anbieter&quot;).
      </p>
      <p>
        (2) Der Dienst richtet sich an Unternehmer im Sinne von § 14 BGB. Die Nutzung durch Verbraucher
        ist ebenfalls möglich.
      </p>
      <p>
        (3) Abweichende Geschäftsbedingungen des Nutzers werden nicht anerkannt, es sei denn, der Anbieter
        stimmt ihrer Geltung ausdrücklich schriftlich zu.
      </p>

      <h2>§ 2 Leistungsbeschreibung</h2>
      <p>
        (1) Pixyo ist eine webbasierte Plattform zur Erstellung von digitalen Grafiken und Bildmaterialien
        unter Einsatz von KI-Technologien. Der Dienst umfasst insbesondere:
      </p>
      <ul>
        <li>KI-gestützte Bildgenerierung und Produktszenen-Erstellung</li>
        <li>Social-Media-Grafik-Erstellung</li>
        <li>Banner-Konfigurator mit Export-Funktionen</li>
        <li>Brand-Design-Tool zur Erstellung von Design-Systemen</li>
      </ul>
      <p>
        (2) Der Anbieter stellt den Dienst in der jeweils aktuellen Version zur Verfügung. Ein Anspruch
        auf bestimmte Funktionen oder deren Fortbestand besteht nicht, sofern dies nicht ausdrücklich
        vereinbart wurde.
      </p>
      <p>
        (3) Der Anbieter ist berechtigt, den Funktionsumfang des Dienstes jederzeit zu ändern, zu erweitern
        oder einzuschränken, sofern dies für den Nutzer zumutbar ist.
      </p>

      <h2>§ 3 Vertragsschluss und Registrierung</h2>
      <p>
        (1) Die Nutzung des Dienstes setzt eine Registrierung voraus. Durch die Registrierung gibt der
        Nutzer ein Angebot auf Abschluss eines Nutzungsvertrages ab.
      </p>
      <p>
        (2) Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige Angaben
        zu machen und diese aktuell zu halten.
      </p>
      <p>
        (3) Der Anbieter behält sich vor, Registrierungen ohne Angabe von Gründen abzulehnen.
      </p>

      <h2>§ 4 Nutzungsrechte</h2>
      <p>
        (1) Der Nutzer erhält für die Dauer des Vertragsverhältnisses ein einfaches, nicht übertragbares
        Recht zur bestimmungsgemäßen Nutzung des Dienstes.
      </p>
      <p>
        (2) An den durch den Dienst generierten Inhalten (Bilder, Grafiken, Texte) räumt der Anbieter dem
        Nutzer ein einfaches, zeitlich unbeschränktes Nutzungsrecht ein. Der Nutzer darf die generierten
        Inhalte für eigene gewerbliche und private Zwecke verwenden.
      </p>
      <p>
        (3) Der Nutzer ist dafür verantwortlich, dass die von ihm hochgeladenen Inhalte (z.B. Produktfotos,
        Logos) keine Rechte Dritter verletzen.
      </p>

      <h2>§ 5 Pflichten des Nutzers</h2>
      <p>Der Nutzer verpflichtet sich:</p>
      <ul>
        <li>Den Dienst nicht für rechtswidrige Zwecke zu nutzen</li>
        <li>Keine Inhalte hochzuladen, die gegen geltendes Recht verstoßen</li>
        <li>Seine Zugangsdaten vertraulich zu behandeln und vor dem Zugriff Dritter zu schützen</li>
        <li>Den Dienst nicht in einer Weise zu nutzen, die dessen Funktionsfähigkeit beeinträchtigt</li>
        <li>Keine automatisierten Zugriffe oder Massenabfragen durchzuführen</li>
      </ul>

      <h2>§ 6 Preise und Zahlung</h2>
      <p>
        (1) Die aktuellen Preise und Leistungsumfänge der verfügbaren Tarife sind auf der Website
        des Dienstes einsehbar.
      </p>
      <p>
        (2) Alle Preise verstehen sich als Nettopreise zuzüglich der gesetzlichen Umsatzsteuer,
        sofern nicht anders angegeben.
      </p>
      <p>
        (3) Der kostenlose Tarif (&quot;Starter&quot;) ist in seinem Funktionsumfang und seiner Nutzung
        beschränkt. Die genauen Limits sind in der jeweiligen Tarifbeschreibung aufgeführt.
      </p>
      <p>
        (4) Kostenpflichtige Tarife werden monatlich im Voraus in Rechnung gestellt.
      </p>

      <h2>§ 7 Verfügbarkeit</h2>
      <p>
        (1) Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit des Dienstes.
        Eine Verfügbarkeit von 100 % kann technisch jedoch nicht gewährleistet werden.
      </p>
      <p>
        (2) Der Anbieter behält sich vor, den Dienst vorübergehend einzuschränken, wenn dies im Hinblick
        auf Wartungsarbeiten, Sicherheit oder Kapazitätsgrenzen erforderlich ist.
      </p>

      <h2>§ 8 KI-generierte Inhalte</h2>
      <p>
        (1) Die durch den Dienst generierten Inhalte werden unter Einsatz von KI-Technologien
        Dritter (Google Gemini, Anthropic Claude) erstellt. Der Anbieter übernimmt keine Gewähr
        für die Richtigkeit, Vollständigkeit oder Eignung der generierten Inhalte.
      </p>
      <p>
        (2) Der Nutzer ist selbst dafür verantwortlich, die generierten Inhalte vor der Verwendung
        auf ihre Eignung und Rechtmäßigkeit zu prüfen.
      </p>
      <p>
        (3) Der Anbieter übernimmt keine Haftung für Schäden, die durch die Verwendung
        KI-generierter Inhalte entstehen.
      </p>

      <h2>§ 9 Haftung</h2>
      <p>
        (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit.
      </p>
      <p>
        (2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher
        Vertragspflichten (Kardinalpflichten). In diesem Fall ist die Haftung auf den
        vorhersehbaren, vertragstypischen Schaden begrenzt.
      </p>
      <p>
        (3) Die vorstehenden Haftungsbeschränkungen gelten nicht für Schäden aus der Verletzung
        des Lebens, des Körpers oder der Gesundheit.
      </p>

      <h2>§ 10 Vertragslaufzeit und Kündigung</h2>
      <p>
        (1) Der kostenlose Tarif kann jederzeit ohne Einhaltung einer Frist durch Löschung des
        Nutzerkontos beendet werden.
      </p>
      <p>
        (2) Kostenpflichtige Tarife haben eine Mindestlaufzeit von einem Monat und verlängern sich
        automatisch um jeweils einen weiteren Monat, sofern nicht mit einer Frist von 14 Tagen
        zum Ende der jeweiligen Laufzeit gekündigt wird.
      </p>
      <p>
        (3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
      </p>
      <p>
        (4) Nach Beendigung des Vertrages werden die Nutzerdaten nach einer Frist von 30 Tagen
        gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2>§ 11 Änderungen der AGB</h2>
      <p>
        (1) Der Anbieter behält sich vor, diese AGB mit Wirkung für die Zukunft zu ändern. Der
        Nutzer wird über Änderungen rechtzeitig per E-Mail informiert.
      </p>
      <p>
        (2) Widerspricht der Nutzer der Geltung der neuen AGB nicht innerhalb von vier Wochen nach
        Zugang der Änderungsmitteilung, gelten die geänderten AGB als angenommen.
      </p>

      <h2>§ 12 Schlussbestimmungen</h2>
      <p>
        (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
      </p>
      <p>
        (2) Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder
        öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand Limburg an der Lahn.
      </p>
      <p>
        (3) Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein, so wird
        dadurch die Wirksamkeit der übrigen Bestimmungen nicht berührt.
      </p>
    </LegalPageLayout>
  );
}
