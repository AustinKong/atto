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
