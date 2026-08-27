// Thin wrapper over SheetJS for the admin bulk-import feature: read an
// uploaded .xlsx/.csv into row objects keyed by header, and generate a
// downloadable .xlsx template with headers + one example row.

// SheetJS is by far the heaviest dependency in the app and only the admin
// bulk-import / export ever touches it, yet a static import put it in the
// main chunk that every visitor downloads before seeing a vet listing.
// Loading it on demand keeps it out of that chunk entirely; the first admin
// action pays a short fetch, everyone else never pays at all.
//
// Cached by the browser and by the module system after the first call, so
// repeated imports/exports in one session do not re-download it.
type Sheet = typeof import('xlsx');
let xlsxPromise: Promise<Sheet> | null = null;
function loadXLSX(): Promise<Sheet> {
  xlsxPromise ??= import('xlsx');
  return xlsxPromise;
}

export type SheetRow = Record<string, string>;

// Parse the first sheet of an uploaded workbook into an array of row objects.
// Keys are the header-row cell values; every value is coerced to a trimmed
// string so downstream mappers don't have to juggle numbers vs strings.
export async function readSheetRows(file: File): Promise<SheetRow[]> {
  const XLSX = await loadXLSX();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = wb.Sheets[firstSheetName];
  // defval:'' so missing cells come back as empty strings, not undefined.
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return raw.map((row) => {
    const out: SheetRow = {};
    for (const [key, value] of Object.entries(row)) {
      out[String(key).trim()] = value == null ? '' : String(value).trim();
    }
    return out;
  });
}

// Build and download an .xlsx of real data: a header row plus one row per
// record (each an object keyed by header). Used by the admin "Backup / Export".
export async function downloadRows(
  filename: string,
  headers: string[],
  rows: Record<string, string>[],
): Promise<void> {
  const XLSX = await loadXLSX();
  const aoa = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ''))];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  sheet['!cols'] = headers.map((h) => ({ wch: Math.max(14, Math.min(40, h.length + 6)) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Data');
  XLSX.writeFile(wb, filename);
}

// Build and download an .xlsx template: a header row plus one example row so
// the admin can see the expected format for each column.
export async function downloadTemplate(
  filename: string,
  headers: string[],
  sampleRow: Record<string, string>,
): Promise<void> {
  const XLSX = await loadXLSX();
  const aoa = [headers, headers.map((h) => sampleRow[h] ?? '')];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  // Reasonable column widths so the template is readable on open.
  sheet['!cols'] = headers.map((h) => ({ wch: Math.max(14, Math.min(40, h.length + 6)) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Template');
  XLSX.writeFile(wb, filename);
}
