/**
 * Reads the text content from uploaded .txt and .pdf files.
 * For .txt files, reads directly as text.
 * For .pdf files, extracts visible text content.
 */

export async function readFileContent(file: File): Promise<string> {
  const ext = file.name.toLowerCase();

  if (ext.endsWith(".txt")) {
    return await file.text();
  }

  if (ext.endsWith(".pdf")) {
    return await readPdfAsText(file);
  }

  return `[Unsupported file type: ${file.name}]`;
}

async function readPdfAsText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Simple PDF text extraction - looks for text between BT/ET markers
    // and parenthesized strings
    let text = "";
    const decoder = new TextDecoder("latin1");
    const raw = decoder.decode(bytes);

    // Extract text from PDF streams using regex for common text operators
    const textMatches = raw.match(/\(([^)]*)\)/g);
    if (textMatches) {
      const extracted = textMatches
        .map((m) => m.slice(1, -1))
        .filter((t) => t.length > 0 && /[a-zA-Z0-9]/.test(t))
        .join(" ");

      if (extracted.length > 50) {
        text = extracted;
      }
    }

    // Fallback: read raw readable characters
    if (text.length < 50) {
      const readableChunks: string[] = [];
      let currentChunk = "";

      for (let i = 0; i < raw.length; i++) {
        const code = raw.charCodeAt(i);
        if (code >= 32 && code <= 126) {
          currentChunk += raw[i];
        } else {
          if (currentChunk.length > 3) {
            readableChunks.push(currentChunk);
          }
          currentChunk = "";
        }
      }
      if (currentChunk.length > 3) readableChunks.push(currentChunk);

      text = readableChunks
        .filter((chunk) => /[a-zA-Z]{2,}/.test(chunk))
        .join(" ")
        .substring(0, 5000);
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
