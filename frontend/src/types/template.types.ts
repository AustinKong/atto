export type TemplateSummary = {
  id: string;
  title: string;
  description: string;
  source: 'local' | 'remote' | 'both';
};

export type Template = {
  id: string;
  title: string;
  description: string;
  content: string;
  source: 'local' | 'remote';
};

export type TemplateRenderRect = {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TemplateRenderGeometry = Record<string, TemplateRenderRect[]>;

export type RenderedTemplate = {
  pdfBlob: Blob;
  geometry: TemplateRenderGeometry;
};
