// === File: src/config/nodeMap.js ===

export const nodeMap = {
  // 🔹 AI/ML
  summarizetext: 'lambda-flow-backend-dev-aiCategory',
  classifytext: 'lambda-flow-backend-dev-aiCategory',
  extractentities: 'lambda-flow-backend-dev-aiCategory',
  sentimentanalysis: 'lambda-flow-backend-dev-aiCategory',
  generatetext: 'lambda-flow-backend-dev-aiCategory',
  texttospeech: 'lambda-flow-backend-dev-aiCategory',
  imageanalysis: 'lambda-flow-backend-dev-aiCategory',
  documentocr: 'lambda-flow-backend-dev-aiCategory',

  // 🔸 Control Flow
  condition: 'lambda-flow-backend-dev-controlCategory',
  ifelse: 'lambda-flow-backend-dev-controlCategory',
  switchcase: 'lambda-flow-backend-dev-controlCategory',
  loopforeach: 'lambda-flow-backend-dev-controlCategory',
  parallelexecution: 'lambda-flow-backend-dev-controlCategory',
  trycatch: 'lambda-flow-backend-dev-controlCategory',
  retry: 'lambda-flow-backend-dev-controlCategory',
  delay: 'lambda-flow-backend-dev-controlCategory',
  terminate: 'lambda-flow-backend-dev-controlCategory',
  goto: 'lambda-flow-backend-dev-controlCategory',

  // 🟡 Data Transformation
  buildjson: 'lambda-flow-backend-dev-dataCategory',
  mergejson: 'lambda-flow-backend-dev-dataCategory',
  parsecsv: 'lambda-flow-backend-dev-dataCategory',
  jsontocsv: 'lambda-flow-backend-dev-dataCategory',
  flattenjson: 'lambda-flow-backend-dev-dataCategory',
  mathexpression: 'lambda-flow-backend-dev-dataCategory',
  filterdata: 'lambda-flow-backend-dev-dataCategory',
  texttemplate: 'lambda-flow-backend-dev-dataCategory',
  stringformatter: 'lambda-flow-backend-dev-dataCategory',
  generatepdf: 'lambda-flow-backend-dev-dataCategory',
  extractfield: 'lambda-flow-backend-dev-dataCategory',
  customdatatransformation: 'lambda-flow-backend-dev-dataCategory',
  renamejsonkeys: 'lambda-flow-backend-dev-dataCategory',

  // 🟤 File & Storage
  readfile: 'lambda-flow-backend-dev-fileCategory',
  writefile: 'lambda-flow-backend-dev-fileCategory',
  uploadtos3: 'lambda-flow-backend-dev-fileCategory',
  downloadfroms3: 'lambda-flow-backend-dev-fileCategory',
  appendtofile: 'lambda-flow-backend-dev-fileCategory',
  lists3files: 'lambda-flow-backend-dev-fileCategory',
  putitem: 'lambda-flow-backend-dev-fileCategory',
  getitem: 'lambda-flow-backend-dev-fileCategory',
  scandynamodb: 'lambda-flow-backend-dev-fileCategory',

  // 🔔 Notifications
  smssend: 'lambda-flow-backend-dev-notificationsCategory',
  sendemail: 'lambda-flow-backend-dev-notificationsCategory',

  // 🌐 Integrations & APIs
  httprequest: 'lambda-flow-backend-dev-integrationsCategory',
  graphqlrequest: 'lambda-flow-backend-dev-integrationsCategory',
  crmsync: 'lambda-flow-backend-dev-integrationsCategory',
  sendtoslack: 'lambda-flow-backend-dev-integrationsCategory',

  // 🚀 Triggers
  apigatewaytrigger: 'lambda-flow-backend-dev-triggersCategory',
  eventbridgetrigger: 'lambda-flow-backend-dev-triggersCategory',
  scheduletrigger: 'lambda-flow-backend-dev-triggersCategory',
  snstrigger: 'lambda-flow-backend-dev-triggersCategory',
  s3trigger: 'lambda-flow-backend-dev-triggersCategory',
  dynamodbtrigger: 'lambda-flow-backend-dev-triggersCategory',

  // 🛠️ Utility & Debugging
  logtoconsole: 'lambda-flow-backend-dev-utilityCategory',
  mockdata: 'lambda-flow-backend-dev-utilityCategory',
  viewcontext: 'lambda-flow-backend-dev-utilityCategory',
  comment: 'lambda-flow-backend-dev-utilityCategory',
  breakpoint: 'lambda-flow-backend-dev-utilityCategory',
  generateuuid: 'lambda-flow-backend-dev-utilityCategory',
};
