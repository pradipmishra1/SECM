declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }
  function pdfParse(dataBuffer: Buffer | Uint8Array): Promise<PdfParseResult>;
  export default pdfParse;
}
