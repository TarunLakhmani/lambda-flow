import pdf from 'html-pdf-node';

export const handler = async (config, input) => {
  const html = input?.html || input?.output?.html;
  const base64 = input?.base64 || input?.output?.base64;

  const options = {
    format: 'A4',
    printBackground: true,
  };

  // 1. Generate from HTML if available
  if (html && typeof html === 'string') {
    const file = { content: html };
    try {
      const pdfBuffer = await pdf.generatePdf(file, options);
      const filename = `generated_${Date.now()}.pdf`;
      return {
        summary: '✅ PDF generated from HTML',
        details: { filename, size: pdfBuffer.length },
        output: {
          base64: pdfBuffer.toString('base64'),
          filename,
          mimeType: 'application/pdf',
        },
      };
    } catch (err) {
      return {
        summary: '❌ Failed to generate PDF from HTML',
        details: { error: err.message },
        output: null,
      };
    }
  }

  // 2. Check if base64 is image and embed in HTML
  if (base64 && typeof base64 === 'string') {
    const isImage = base64.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(base64);

    if (isImage) {
      const imageDataUrl = base64.startsWith('data:image')
        ? base64
        : `data:image/png;base64,${base64}`;

      const wrappedHtml = `
        <html><body style="margin:0;padding:0">
          <img src="${imageDataUrl}" style="max-width:100%;height:auto;" />
        </body></html>
      `;

      try {
        const pdfBuffer = await pdf.generatePdf({ content: wrappedHtml }, options);
        const filename = `image_to_pdf_${Date.now()}.pdf`;
        return {
          summary: '📸 PDF generated from base64 image',
          details: { filename, size: pdfBuffer.length },
          output: {
            base64: pdfBuffer.toString('base64'),
            filename,
            mimeType: 'application/pdf',
          },
        };
      } catch (err) {
        return {
          summary: '❌ Failed to render PDF from base64 image',
          details: { error: err.message },
          output: null,
        };
      }
    }

    // fallback: if base64 is already a PDF
    return {
      summary: '⚠️ Using base64 as-is (assuming PDF)',
      details: { source: 'input.base64' },
      output: {
        base64,
        filename: `pdf_from_base64_${Date.now()}.pdf`,
        mimeType: 'application/pdf',
      },
    };
  }

  // 3. Nothing usable found
  return {
    summary: '❌ No HTML or valid base64 found to generate PDF',
    details: {},
    output: null,
  };
};
