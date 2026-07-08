/**
 * Legal Page — Impressum & Datenschutz (gesetzliches Minimum)
 * ===============================================================
 * Enthält NUR, was gesetzlich vorgeschrieben ist:
 * - §5 TMG: Anbieterkennzeichnung
 * - Art. 13 DSGVO: Informationspflicht bei Datenerhebung
 *
 * Bewusst NICHT enthalten (nicht vorgeschrieben für ein SaaS-Tool ohne
 * journalistisch-redaktionelle Inhalte): §18 MStV-Verantwortlicher,
 * freiwilliger Haftungsausschluss, Feedback-Funktion.
 *
 * TODO VOR LIVE-GANG: Jeden [PLATZHALTER] durch echte Daten ersetzen.
 * Mit "GMBH/UG:" markierte Zeilen nur behalten, falls ihr eine
 * Kapitalgesellschaft seid — bei Einzelunternehmen/Kleingewerbe streichen.
 */

const lbg = { minHeight: "100vh", background: "#060810", color: "#e2e8f0", fontFamily: "'Exo 2','Segoe UI',sans-serif" };
const lsc = { position: "relative", zIndex: 1, padding: "20px 16px 100px", maxWidth: 520, margin: "0 auto" };
const lcard = { background: "#111827", border: "1px solid #1e2d40", borderRadius: 8, padding: 16, marginBottom: 12 };
const llbl = { fontSize: 10, color: "#4a5568", letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10, display: "block" };
const h2 = { fontSize: 13, fontWeight: 700, color: "#00d4ff", marginTop: 14, marginBottom: 6 };
const p = { fontSize: 13, color: "#c4cfdf", lineHeight: 1.7, marginBottom: 8 };

export function LegalPage() {
  return (
    <div style={lbg}>
      <div style={lsc}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#00d4ff", letterSpacing: 2, marginBottom: 20 }}>
          ◈ IMPRESSUM &amp; DATENSCHUTZ
        </div>

        <div style={lcard}>
          <span style={llbl}>Angaben gemäß § 5 TMG</span>
          <p style={p}>
            [VOR- UND NACHNAME bzw. GMBH/UG: Firmenname]<br />
            [STRASSE UND HAUSNUMMER]<br />
            [PLZ UND ORT]
          </p>
          <div style={h2}>Kontakt</div>
          <p style={p}>E-Mail: [DEINE@EMAIL.DE]</p>
          <div style={h2}>GMBH/UG: Vertreten durch</div>
          <p style={p}>[GESCHÄFTSFÜHRER]</p>
          <div style={h2}>GMBH/UG: Handelsregister</div>
          <p style={p}>[Registergericht, HRB-Nummer]</p>
          <div style={h2}>Umsatzsteuer-ID</div>
          <p style={p}>[USt-IdNr. gemäß §27a UStG — falls vorhanden, sonst Zeile löschen]</p>
        </div>

        <div style={lcard}>
          <span style={llbl}>Datenschutz (Art. 13 DSGVO)</span>
          <div style={h2}>Verantwortlicher</div>
          <p style={p}>Wie oben unter "Angaben gemäß § 5 TMG" genannt.</p>
          <div style={h2}>Erhobene Daten</div>
          <p style={p}>[PLATZHALTER — konkret benennen: Simulationsdaten, Zahlungsdaten via Stripe, Server-Logs bei Vercel-Hosting]</p>
          <div style={h2}>Rechtsgrundlage & Zweck</div>
          <p style={p}>[Art. 6 Abs. 1 DSGVO — je nach Verarbeitung lit. b (Vertrag) oder lit. f (berechtigtes Interesse)]</p>
          <div style={h2}>Speicherdauer</div>
          <p style={p}>[Konkrete Frist oder Löschkriterium]</p>
          <div style={h2}>Betroffenenrechte</div>
          <p style={p}>Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch (Art. 15–21 DSGVO) sowie Beschwerderecht bei der zuständigen Aufsichtsbehörde.</p>
        </div>
      </div>
    </div>
  );
}
