export default function Impressum() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Impressum</h1>
      <p className="mb-2">Angaben gemäß § 5 TMG:</p>

      <p className="mb-2">
        GoLuma GmbH<br />
        Musterstraße 12<br />
        6370 Kitzbühel<br />
        Österreich
      </p>

      <p className="mb-2">
        Vertreten durch: Max Mustermann<br />
        E-Mail: kontakt@goluma.at<br />
        Telefon: +43 123 456789
      </p>

      <p className="text-sm text-gray-500 mt-6">
        Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Max Mustermann
      </p>
    </div>
  );
}
