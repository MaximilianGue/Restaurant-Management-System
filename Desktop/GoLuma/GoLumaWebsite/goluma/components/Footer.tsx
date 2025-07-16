import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        {/* Links */}
        <div className="flex space-x-4 mb-2 md:mb-0">
          <Link href="/impressum" className="hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:underline">
            Datenschutz
          </Link>
          <Link href="/kontakt" className="hover:underline">
            Kontakt
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-gray-500">
          © 2025 <span className="font-semibold text-gray-700">GoLuma</span>. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
