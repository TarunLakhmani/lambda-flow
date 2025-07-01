// === File: src/components/nodeSpecs.js ===

// === File: src/components/nodeSpecs.js ===

export const nodeSpecs = {
  // --- AI/ML ---
  'Summarize Text': {
    description: 'Generates a concise summary of the input text using LLMs.',
    config: [],
    input: ['text'],
    fieldDescriptions: {
      input: {
        text: 'The full text content to summarize.'
      }
    }
  },
  'Classify Text': {
    description: 'Classifies the input text into specified categories using LLMs.',
    config: ['categories'],
    input: ['text'],
    fieldDescriptions: {
      config: {
        categories: 'Comma-separated list of categories to classify into.'
      },
      input: {
        text: 'Text to classify.'
      }
    }
  },
  'Extract Entities': {
    description: 'Extracts named entities (like people, places) from the input text.',
    config: ['entityTypes'],
    input: ['text'],
    fieldDescriptions: {
      config: {
        entityTypes: 'Comma-separated list of entity types to extract (e.g., PERSON, ORG).'
      },
      input: {
        text: 'Text to extract entities from.'
      }
    }
  },
  'Sentiment Analysis': {
    description: 'Analyzes sentiment (positive, negative, neutral) in the input text.',
    config: [],
    input: ['text'],
    fieldDescriptions: {
      input: {
        text: 'The text for which to detect sentiment.'
      }
    }
  },
  'Generate Text (Bedrock)': {
    description: 'Generates creative or structured text based on a prompt using Bedrock.',
    config: ['model', 'temperature'],
    input: ['prompt'],
    fieldDescriptions: {
      config: {
        model: 'Model ID or name to use.',
        temperature: 'Controls randomness: 0 (deterministic) to 1 (creative).'
      },
      input: {
        prompt: 'Instruction or starting text for the model.'
      }
    }
  },
  'Text to Speech (Polly)': {
    description: 'Converts text into natural-sounding audio using Amazon Polly.',
    config: ['voice'],
    input: ['text'],
    fieldDescriptions: {
      config: {
        voice: 'Name of the Amazon Polly voice to use.'
      },
      input: {
        text: 'Text to synthesize into speech.'
      }
    }
  },
  'Image Analysis (Rekognition)': {
    description: 'Analyzes an image to detect labels, faces, or text.',
    config: ['features'],
    input: ['image'],
    inputTypes: { image: 'file' },
    fieldDescriptions: {
      config: {
        features: 'Comma-separated features to detect (e.g., LABELS, FACES).'
      },
      input: {
        image: 'Upload an image file (JPG/PNG).'
      }
    }
  },
  'Document OCR (Textract)': {
    description: 'Performs Optical Character Recognition on uploaded documents.',
    config: [],
    input: ['document'],
    inputTypes: { document: 'file' },
    fieldDescriptions: {
      input: {
        document: 'Upload a document file (PDF/Image) to extract text from.'
      }
    }
  },

  // --- Control Flow ---
  'Condition': {
    description: 'Evaluates a boolean expression against the incoming JSON payload and decides the execution path.',
    config: ['expression'],
    input: ['json'],
    fieldDescriptions: {
      config: {
        expression: 'A JavaScript-style Boolean expression (e.g., `input.amount > 1000`). Use the `input` object to reference fields from the incoming payload.'
      },
      input: {
        json: 'The JSON object to test against the expression.'
      }
    }
  },

  'Loop / For Each': {
    description: 'Iterates over every element in a list and executes the downstream branch once per item.',
    config: ['iterator'],
    input: ['list'],
    fieldDescriptions: {
      config: {
        iterator: 'Variable name that represents the current item inside each iteration (e.g., `item`).'
      },
      input: {
        list: 'Array of items to iterate over.'
      }
    }
  },

  'Delay / Wait': {
    description: 'Pauses workflow execution for the specified duration before continuing.',
    config: ['duration'],
    input: [],
    fieldDescriptions: {
      config: {
        duration: 'Time to wait, in milliseconds (e.g., `5000` for 5 seconds).'
      }
    }
  },

  'Terminate Workflow': {
    description: 'Stops the workflow immediately and marks it as terminated.',
    config: ['message'],
    input: [],
    fieldDescriptions: {
      config: {
        message: 'Optional reason or summary recorded in the workflow log upon termination.'
      }
    }
  },

  'Jump / Goto': {
    description: 'Transfers execution directly to another node within the current workflow.',
    config: ['targetNodeId'],
    input: [],
    fieldDescriptions: {
      config: {
        targetNodeId: 'The unique ID of the node to jump to. Ensure the target exists to prevent runtime errors.'
      }
    }
  },

  // --- Data Processing ---
  'Build JSON': {
    description: 'Constructs a new JSON object by mapping input fields to custom keys.',
    config: ['fields'],
    input: ['json'],
    fieldDescriptions: {
      config: {
        fields: 'JSON object mapping output keys to expressions (e.g., `{ "name": "input.firstName + \' \' + input.lastName" }`).'
      },
      input: {
        json: 'The input JSON from which to build new fields.'
      }
    }
  },

  'Merge JSON': {
    description: 'Combines multiple JSON objects into one. Useful for synchronizing parallel branches.',
    config: ['expectedCount', 'timeoutMs'],
    input: [],
    fieldDescriptions: {
      config: {
        expectedCount: 'Number of branches/inputs to wait for before merging.',
        timeoutMs: 'Maximum time to wait (in milliseconds) before proceeding with available inputs.'
      }
    }
  },

  'Parse CSV': {
    description: 'Converts a raw CSV string into a list of JSON objects.',
    config: [],
    input: ['csvText'],
    fieldDescriptions: {
      input: {
        csvText: 'Plain CSV text (including headers) to parse into structured data.'
      }
    }
  },

  'JSON to CSV': {
    description: 'Transforms a JSON array into CSV text based on selected fields.',
    config: ['fields'],
    input: ['json'],
    fieldDescriptions: {
      config: {
        fields: 'Comma-separated field names to include in the CSV (e.g., `name,age,email`).'
      },
      input: {
        json: 'Array of JSON objects to convert into CSV.'
      }
    }
  },

  'Generate PDF': {
    description: 'Renders an HTML string into a downloadable PDF document.',
    config: [],
    input: ['html'],
    fieldDescriptions: {
      input: {
        html: 'HTML content to render in the PDF (supports inline CSS).'
      }
    }
  },

  'Math Expression': {
    description: 'Evaluates a math expression using variables provided in the input.',
    config: ['expression'],
    input: ['variables'],
    fieldDescriptions: {
      config: {
        expression: 'Math expression string (e.g., `a + b * 2`). Refer to variables using their keys.'
      },
      input: {
        variables: 'A JSON object of variables to use in the expression (e.g., `{ "a": 2, "b": 5 }`).'
      }
    }
  },

  'Filter Data': {
    description: 'Filters a list of data objects based on a criteria expression.',
    config: ['filterCriteria'],
    input: ['data'],
    fieldDescriptions: {
      config: {
        filterCriteria: 'A JavaScript-style filter expression (e.g., `item.age > 18`). Use `item` to reference each object.'
      },
      input: {
        data: 'An array of JSON objects to filter.'
      }
    }
  },

  'Text Template': {
    description: 'Fills a text template with values from the input object.',
    config: ['template'],
    input: ['values'],
    fieldDescriptions: {
      config: {
        template: 'Template string using {{placeholders}} to inject values (e.g., `Hello {{name}}`).'
      },
      input: {
        values: 'JSON object containing values to populate in the template.'
      }
    }
  },

  'String Formatter': {
    description: 'Formats a string using a specified format pattern.',
    config: ['format'],
    input: ['inputString'],
    fieldDescriptions: {
      config: {
        format: 'Format string using placeholders like `{}` or `${}` depending on syntax support.'
      },
      input: {
        inputString: 'Input string to format or wrap with the configured pattern.'
      }
    }
  },

  'Flatten JSON': {
    description: 'Flattens a nested JSON object into a single-level key-value map.',
    config: [],
    input: ['json'],
    fieldDescriptions: {
      input: {
        json: 'A deeply nested JSON object to flatten.'
      }
    }
  },

  'Rename JSON Keys': {
    description: 'Renames keys in a JSON object based on a provided mapping.',
    config: ['mapping'],
    input: ['json'],
    fieldDescriptions: {
      config: {
        mapping: 'JSON object mapping old keys to new keys (e.g., `{ "oldName": "newName" }`).'
      },
      input: {
        json: 'JSON object whose keys should be renamed.'
      }
    }
  },

  'Extract Field': {
    description: 'Extracts a specific field or nested value from a JSON object.',
    config: ['fieldPath'],
    input: ['json'],
    fieldDescriptions: {
      config: {
        fieldPath: 'Dot-separated path to the desired field (e.g., `user.profile.name`).'
      },
      input: {
        json: 'Input JSON object from which to extract the field.'
      }
    }
  },
  // --- Integrations ---
  // --- Integrations & APIs ---
  'HTTP Request': {
    description: 'Sends an HTTP request to an external API or service endpoint.',
    config: ['url', 'method', 'headers'],
    input: ['body'],
    fieldDescriptions: {
      config: {
        url: 'The full URL to send the request to (e.g., `https://api.example.com/data`).',
        method: 'HTTP method to use (GET, POST, PUT, DELETE, etc.).',
        headers: 'Optional JSON object of headers to include (e.g., `{ "Authorization": "Bearer token" }`).'
      },
      input: {
        body: 'Optional request payload to send as JSON body (for POST, PUT, etc.).'
      }
    }
  },

  'Webhook Listener': {
    description: 'Creates an endpoint that listens for incoming HTTP webhooks and triggers the workflow.',
    config: ['path'],
    input: [],
    fieldDescriptions: {
      config: {
        path: 'Relative path for the webhook (e.g., `/order-updated`). This will be exposed as a public URL.'
      }
    }
  },

  'GraphQL Request': {
    description: 'Sends a GraphQL request to the specified endpoint using dynamic input fields.',
    config: ['endpoint'],
    input: ['operation', 'fields', 'filters'],
    fieldDescriptions: {
      config: {
        endpoint: 'The full GraphQL API URL (e.g., `https://api.example.com/graphql`).'
      },
      input: {
        operation: 'The name of the query or mutation (e.g., `getUser`).',
        fields: 'Comma-separated fields to retrieve (e.g., `id,name,email`).',
        filters: 'Optional JSON object of arguments/filters for the operation (e.g., `{ "id": "123" }`).'
      }
    }
  },

  'Twilio SMS': {
    description: 'Sends an SMS message using the Twilio API.',
    config: ['accountSid', 'authToken', 'from'],
    input: ['to', 'message'],
    fieldDescriptions: {
      config: {
        accountSid: 'Twilio Account SID from your Twilio console.',
        authToken: 'Twilio Auth Token for secure API access.',
        from: 'Twilio phone number to send the message from.'
      },
      input: {
        to: 'Recipient phone number in E.164 format (e.g., `+15555555555`).',
        message: 'The text message content to send.'
      }
    }
  },

  'Send to Slack': {
    description: 'Sends a message to a Slack channel using a webhook or bot token.',
    config: ['webhookUrl', 'botToken', 'channelId'],
    input: ['message'],
    fieldDescriptions: {
      config: {
        webhookUrl: 'Incoming Slack webhook URL (if not using bot token). Optional if `botToken` is provided.',
        botToken: 'Slack Bot User OAuth Token (e.g., `xoxb-...`). Optional if `webhookUrl` is provided.',
        channelId: 'Slack channel ID to send the message to (e.g., `C0123456789`).'
      },
      input: {
        message: 'The message text or rich payload to post.'
      }
    }
  },

  'CRM Sync (e.g., HubSpot)': {
    description: 'Pushes customer or lead data to a CRM platform like HubSpot.',
    config: ['apiKey'],
    input: ['data'],
    fieldDescriptions: {
      config: {
        apiKey: 'API key or access token for the CRM service.'
      },
      input: {
        data: 'JSON object representing the contact or entity to sync (e.g., `{ "email": "user@example.com" }`).'
      }
    }
  },


  // --- Triggers ---
  // --- Triggers ---
  'API Gateway Trigger': {
    description: 'Starts the workflow when an HTTP request is made to the generated API Gateway endpoint.',
    config: [],
    input: ['headers', 'method', 'body'],
    fieldDescriptions: {
      input: {
        headers: 'HTTP headers from the incoming request.',
        method: 'HTTP method used (e.g., GET, POST).',
        body: 'Parsed JSON body of the incoming request.'
      }
    }
  },

  'S3 Trigger': {
    description: 'Starts the workflow when a file is created or modified in a specified S3 bucket.',
    config: [],
    input: ['bucket', 'key', 'eventName'],
    fieldDescriptions: {
      input: {
        bucket: 'Name of the S3 bucket where the event occurred.',
        key: 'Object key (file path) of the S3 item that triggered the event.',
        eventName: 'Type of S3 event (e.g., `ObjectCreated:Put`).'
      }
    }
  },

  'EventBridge Trigger': {
    description: 'Starts the workflow when a matching EventBridge rule fires based on source and detailType.',
    config: ['source', 'detailType'],
    input: [],
    fieldDescriptions: {
      config: {
        source: 'Event source string to match (e.g., `com.myapp.order`).',
        detailType: 'Event detail type to match (e.g., `OrderCreated`).'
      }
    }
  },

  'Schedule Trigger': {
    description: 'Starts the workflow on a recurring schedule defined by a cron expression.',
    config: ['cron'],
    input: [],
    fieldDescriptions: {
      config: {
        cron: 'Cron expression in AWS format (e.g., `rate(5 minutes)` or `cron(0 12 * * ? *)`).'
      }
    }
  },

  'DynamoDB Trigger': {
    description: 'Starts the workflow in response to changes (insert/update/delete) in a DynamoDB table.',
    config: [],
    input: ['eventName', 'keys', 'newImage'],
    fieldDescriptions: {
      input: {
        eventName: 'Type of DynamoDB event (e.g., `INSERT`, `MODIFY`, `REMOVE`).',
        keys: 'Primary key values of the changed item.',
        newImage: 'New image of the item (only present for INSERT/MODIFY).'
      }
    }
  },

  'SNS Trigger': {
    description: 'Starts the workflow when an SNS topic receives a message.',
    config: [],
    input: ['message', 'subject'],
    fieldDescriptions: {
      input: {
        message: 'Body of the SNS message.',
        subject: 'Subject of the SNS message (if provided).'
      }
    }
  },


  // --- Notifications ---
  'Send Email (SES)': {
    description: 'Sends an email using Amazon SES (Simple Email Service).',
    config: ['from'],
    input: ['to', 'subject', 'body'],
    fieldDescriptions: {
      config: {
        from: 'Verified email address to send the message from (must be verified in SES).'
      },
      input: {
        to: 'Recipient email address (or comma-separated list of addresses).',
        subject: 'Subject line of the email.',
        body: 'Email body in plain text or HTML format.'
      }
    }
  },

  'Send SMS (Twilio)': {
    description: 'Sends a text message via Twilio SMS.',
    config: ['accountSid', 'authToken', 'from'],
    input: ['to', 'message'],
    fieldDescriptions: {
      config: {
        accountSid: 'Twilio Account SID from your Twilio dashboard.',
        authToken: 'Twilio Auth Token for API access.',
        from: 'Twilio-verified phone number to send messages from.'
      },
      input: {
        to: 'Recipient phone number (E.164 format, e.g., `+14155552671`).',
        message: 'Text content of the SMS message.'
      }
    }
  },

  'Slack Message': {
    description: 'Sends a message to a Slack channel via an incoming webhook.',
    config: ['webhookUrl'],
    input: ['message'],
    fieldDescriptions: {
      config: {
        webhookUrl: 'Slack Incoming Webhook URL for the target channel.'
      },
      input: {
        message: 'The text or JSON payload of the Slack message.'
      }
    }
  },

  'Push Notification': {
    description: 'Sends a push notification to a specific device using a device token.',
    config: ['deviceToken'],
    input: ['message'],
    fieldDescriptions: {
      config: {
        deviceToken: 'Device token to deliver the push notification to (platform-specific).'
      },
      input: {
        message: 'The notification message to send.'
      }
    }
  },

  // --- File Operations ---
  // --- File & Storage ---
  'Upload to S3': {
    description: 'Uploads a file or base64 content to an Amazon S3 bucket.',
    config: ['bucket', 'key'],
    input: ['file', 'base64', 'filename'],
    inputTypes: { file: 'file' },
    fieldDescriptions: {
      config: {
        bucket: 'Target S3 bucket name.',
        key: 'S3 object key (path/filename) where the file should be stored.'
      },
      input: {
        file: 'Optional file input (used in browser context).',
        base64: 'Optional base64-encoded string of the file content.',
        filename: 'Original filename or name to save in S3.'
      }
    }
  },

  'Download from S3': {
    description: 'Downloads a file from Amazon S3 and returns its content as base64.',
    config: ['bucket', 'key'],
    input: [],
    fieldDescriptions: {
      config: {
        bucket: 'S3 bucket name from which to download.',
        key: 'S3 object key (file path) to retrieve.'
      }
    }
  },

  'Read File': {
    description: 'Reads an uploaded file and returns its content as base64 and text.',
    config: [],
    input: ['file'],
    inputTypes: { file: 'file' },
    fieldDescriptions: {
      input: {
        file: 'Upload a file (text, PDF, image, etc.) to be read into memory.'
      }
    }
  },

  'Write File': {
    description: 'Writes base64 content to a local file on disk.',
    config: ['outputDir'],
    input: ['base64', 'filename'],
    inputTypes: {
      base64: 'text',
      filename: 'text'
    },
    defaultConfig: {
      outputDir: './output'
    },
    fieldDescriptions: {
      config: {
        outputDir: 'Directory path where the file will be saved (e.g., `./output`).'
      },
      input: {
        base64: 'Base64-encoded content to write to the file.',
        filename: 'Desired name for the saved file (e.g., `report.pdf`).'
      }
    }
  },

  'Append to File': {
    description: 'Appends text or base64 content to an existing file, or creates the file if it does not exist.',
    config: ['outputDir'],
    input: ['text', 'base64', 'filename'],
    fieldDescriptions: {
      config: {
        outputDir: 'Directory where the file is located or should be created.'
      },
      input: {
        text: 'Plain text content to append.',
        base64: 'Optional base64-encoded content to decode and append.',
        filename: 'Name of the file to append to.'
      }
    }
  },

  'List S3 Files': {
    description: 'Lists files in an S3 bucket under a specified prefix.',
    config: ['bucket', 'prefix'],
    input: [],
    fieldDescriptions: {
      config: {
        bucket: 'S3 bucket to list files from.',
        prefix: 'Optional path prefix to filter the files (e.g., `logs/`).'
      }
    }
  },

  'Put Item (DynamoDB)': {
    description: 'Inserts or updates an item in a DynamoDB table.',
    config: ['tableName'],
    input: ['json'],
    fieldDescriptions: {
      config: {
        tableName: 'Name of the DynamoDB table.'
      },
      input: {
        json: 'JSON object representing the item to insert or update.'
      }
    }
  },

  'Get Item (DynamoDB)': {
    description: 'Retrieves a single item from DynamoDB based on its key.',
    config: ['tableName'],
    input: ['json'],
    fieldDescriptions: {
      config: {
        tableName: 'Name of the DynamoDB table.'
      },
      input: {
        json: 'Key attributes as a JSON object to retrieve the item (e.g., `{ "id": "123" }`).'
      }
    }
  },

  'Scan DynamoDB': {
    description: 'Scans a DynamoDB table and returns matching items.',
    config: ['tableName'],
    input: ['json'],
    fieldDescriptions: {
      config: {
        tableName: 'Name of the DynamoDB table.'
      },
      input: {
        json: 'Optional scan filter or projection parameters as a JSON object.'
      }
    }
  },

  // --- Utility & Debugging ---
  // --- Utility & Debugging ---
  'Generate UUID': {
    description: 'Generates a universally unique identifier (UUID) and stores it under the given key.',
    config: ['key', 'type'],
    input: [],
    fieldDescriptions: {
      config: {
        key: 'Name of the field to store the UUID in the context or output (e.g., `sessionId`).',
        type: 'UUID version to use (default: `v4`). Supported: `v1`, `v4`.'
      }
    }
  },

  'Log to Console': {
    description: 'Logs a message to the console or workflow execution log for debugging purposes.',
    config: [],
    input: ['message'],
    fieldDescriptions: {
      input: {
        message: 'Message or data to log. Can be a string or a JSON object.'
      }
    }
  },

  'Mock Data': {
    description: 'Generates mock data based on a schema definition and a count.',
    config: ['schema', 'count'],
    input: [],
    fieldDescriptions: {
      config: {
        schema: 'A JSON schema or Faker-style definition for the mock data (e.g., `{ "name": "name.findName", "email": "internet.email" }`).',
        count: 'Number of mock records to generate (default: `1`).'
      }
    }
  },

  'View Context': {
    description: 'Displays the current execution context at this point in the workflow. Useful for debugging.',
    config: [],
    input: [],
    fieldDescriptions: {}
  },

  'Comment': {
    description: 'A non-functional node for leaving inline comments or notes in the workflow.',
    config: ['note'],
    input: [],
    fieldDescriptions: {
      config: {
        note: 'Text or markdown note to display in the canvas for documentation or guidance.'
      }
    }
  },

  'Breakpoint (Dev Only)': {
    description: 'Pauses workflow execution in development mode to inspect the state.',
    config: [],
    input: [],
    fieldDescriptions: {}
  },

};
