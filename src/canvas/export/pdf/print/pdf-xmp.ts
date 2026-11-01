import type { PdfXmpFields } from "./pdf-print.types";

/** What opens an XMP packet. */
const BYTE_ORDER_MARK = String.fromCharCode(0xfeff);

const escaped = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The XMP packet of a PDF/X-4 file, which names the standard. */
export function pdfXmp({ title, producer, date, id }: PdfXmpFields): string {
  const iso = date.toISOString().replace(/\.\d+Z$/, "Z");
  return `<?xpacket begin="${BYTE_ORDER_MARK}" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about=""
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:xmp="http://ns.adobe.com/xap/1.0/"
 xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
 xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/"
 xmlns:pdfxid="http://www.npes.org/pdfx/ns/id/">
<dc:format>application/pdf</dc:format>
<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escaped(title)}</rdf:li></rdf:Alt></dc:title>
<xmp:CreateDate>${iso}</xmp:CreateDate>
<xmp:ModifyDate>${iso}</xmp:ModifyDate>
<xmp:MetadataDate>${iso}</xmp:MetadataDate>
<xmp:CreatorTool>${escaped(producer)}</xmp:CreatorTool>
<pdf:Producer>${escaped(producer)}</pdf:Producer>
<pdf:Trapped>False</pdf:Trapped>
<xmpMM:DocumentID>uuid:${id}</xmpMM:DocumentID>
<xmpMM:InstanceID>uuid:${id}</xmpMM:InstanceID>
<xmpMM:VersionID>1</xmpMM:VersionID>
<xmpMM:RenditionClass>default</xmpMM:RenditionClass>
<pdfxid:GTS_PDFXVersion>PDF/X-4</pdfxid:GTS_PDFXVersion>
</rdf:Description>
</rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}
