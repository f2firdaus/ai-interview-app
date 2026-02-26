import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export const parseResume = async (path: string) => {
  const buffer = fs.readFileSync(path);

  if (path.endsWith(".pdf")) {
    const data = await pdf(buffer);
    return data.text;
  }

  if (path.endsWith(".docx")) {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  }

  return buffer.toString();
};