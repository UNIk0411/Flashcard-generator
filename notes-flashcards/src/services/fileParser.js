import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import JSZip from "jszip";

// Use the exact version matching package.json from CDN to prevent worker bundle issues in Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs";

export const parseFile = async (file) => {
  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "txt" || extension === "md") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read text file."));
      reader.readAsText(file);
    });
  }

  const arrayBuffer = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file buffer."));
    reader.readAsArrayBuffer(file);
  });

  if (extension === "pdf") {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let text = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        text += pageText + "\n";
      }
      
      const trimmedText = text.trim();
      if (!trimmedText) {
        throw new Error("No text content could be extracted from this PDF.");
      }
      return trimmedText;
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      throw new Error("Failed to parse PDF: " + error.message);
    }
  }

  if (extension === "docx") {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      const trimmedText = result.value.trim();
      if (!trimmedText) {
        throw new Error("No text content could be extracted from this Word document.");
      }
      return trimmedText;
    } catch (error) {
      console.error("DOCX Parsing Error:", error);
      throw new Error("Failed to parse Word document: " + error.message);
    }
  }

  if (extension === "pptx") {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const slideFiles = Object.keys(zip.files).filter(
        (name) => name.startsWith("ppt/slides/slide") && name.endsWith(".xml")
      );

      if (slideFiles.length === 0) {
        throw new Error("No slides found in the PowerPoint file.");
      }

      // Sort slide files numerically
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
        return numA - numB;
      });

      let text = "";
      for (const slideFile of slideFiles) {
        const slideXml = await zip.files[slideFile].async("string");
        // OpenXML text tags are typically <a:t>
        const matches = slideXml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
        if (matches) {
          const slideText = matches
            .map((m) => {
              const contentMatch = m.match(/<a:t[^>]*>([^<]*)<\/a:t>/);
              return contentMatch ? contentMatch[1] : "";
            })
            .join(" ");
          text += slideText + "\n";
        }
      }

      const trimmedText = text.trim();
      if (!trimmedText) {
        throw new Error("No text content could be extracted from this PowerPoint presentation.");
      }
      return trimmedText;
    } catch (error) {
      console.error("PPTX Parsing Error:", error);
      throw new Error("Failed to parse PowerPoint presentation: " + error.message);
    }
  }

  throw new Error("Unsupported file format: ." + extension);
};
