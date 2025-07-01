// === File: src/config/nodeCategories.js ===

export const categoryMap = {
  // AI/ML
  summarizetext: 'ai',
  classifytext: 'ai',
  extractentities: 'ai',
  sentimentanalysis: 'ai',
  generatetext: 'ai',
  texttospeech: 'ai',
  imageanalysis: 'ai',
  documentocr: 'ai',

  // Control Flow
  condition: 'control',
  loopforeach: 'control',
  delay: 'control',
  terminate: 'control',
  goto: 'control',

  // Data Transformation
  buildjson: 'data',
  mergejson: 'data',
  parsecsv: 'data',
  jsontocsv: 'data',
  flattenjson: 'data',
  mathexpression: 'data',
  filterdata: 'data',
  texttemplate: 'data',
  stringformatter: 'data',
  generatepdf: 'data',
  extractfield: 'data',
  customdatatransformation: 'data',
  renamejsonkeys: 'data',

  // File & Storage
  readfile: 'file',
  writefile: 'file',
  uploadtos3: 'file',
  downloadfroms3: 'file',
  appendtofile: 'file',
  lists3files: 'file',
  putitem: 'file',
  getitem: 'file',
  scandynamodb: 'file',

  // Integrations & APIs
  httprequest: 'integrations',
  graphqlrequest: 'integrations',
  sendtoslack: 'integrations',

  // Triggers
  apigatewaytrigger: 'triggers',
  scheduletrigger: 'triggers',
  eventbridgetrigger: 'triggers',
  snstrigger: 'triggers',
  s3trigger: 'triggers',
  dynamodbtrigger: 'triggers',

  // Notifications
  sendemail: 'notifications',

  // Utility
  logtoconsole: 'utility',
  mockdata: 'utility',
  viewcontext: 'utility',
  comment: 'utility',
  breakpoint: 'utility',
  generateuuid: 'utility',
};