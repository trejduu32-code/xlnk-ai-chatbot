/**
 * Reads the text content from any uploaded file.
 * Extracts readable text from all file types.
 */

export async function readFileContent(file: File): Promise<string> {
  const ext = file.name.toLowerCase();

  // Text-based files: read directly
  const textExtensions = [
    '.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm',
    '.css', '.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.c',
    '.cpp', '.h', '.rb', '.go', '.rs', '.swift', '.kt', '.sh',
    '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.log',
    '.sql', '.r', '.m', '.php', '.pl', '.lua', '.dart', '.env',
    '.gitignore', '.dockerfile', '.makefile',
  ];

  if (textExtensions.some(e => ext.endsWith(e)) || file.type.startsWith('text/')) {
    return await file.text();
  }

  if (ext.endsWith(".pdf")) {
    return await readPdfAsText(file);
  }

  // Fallback: try reading as text
  try {
    const text = await file.text();
    // Check if it looks like readable text
    const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, '');
    if (printable.length > text.length * 0.7) {
      return printable;
    }
  } catch {}

  // Binary fallback: extract readable strings
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return extractReadableStrings(bytes, file.name);
  } catch {
    return `[Could not extract text from: ${file.name}]`;
  }
}

function extractReadableStrings(bytes: Uint8Array, fileName: string): string {
  const decoder = new TextDecoder("latin1");
  const raw = decoder.decode(bytes);
  const chunks: string[] = [];
  let current = "";

  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code >= 32 && code <= 126) {
      current += raw[i];
    } else {
      if (current.length > 3) chunks.push(current);
      current = "";
    }
  }
  if (current.length > 3) chunks.push(current);

  const text = chunks
    .filter(chunk => /[a-zA-Z]{2,}/.test(chunk))
    .join(" ")
    .substring(0, 10000);

  return text || `[Could not extract text from: ${fileName}]`;
}

async function readPdfAsText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("latin1");
    const raw = decoder.decode(bytes);

    let text = "";
    const textMatches = raw.match(/\(([^)]*)\)/g);
    if (textMatches) {
      const extracted = textMatches
        .map((m) => m.slice(1, -1))
        .filter((t) => t.length > 0 && /[a-zA-Z0-9]/.test(t))
        .join(" ");
      if (extracted.length > 50) text = extracted;
    }

    if (text.length < 50) {
      text = extractReadableStrings(bytes, file.name);
    }

    return text || `[Could not extract text from PDF: ${file.name}]`;
  } catch (e) {
    console.error("PDF read error:", e);
    return `[Error reading PDF: ${file.name}]`;
  }
}

export async function readAllFiles(files: File[]): Promise<string> {
  const results = await Promise.all(
    files.map(async (file) => {
      const content = await readFileContent(file);
      return `--- File: ${file.name} ---\n${content}\n--- End of ${file.name} ---`;
    })
  );
  return results.join("\n\n");
}
