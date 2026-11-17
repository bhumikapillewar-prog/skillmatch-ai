/**
 * Document Parser Service
 * Robustly parses text from PDF, DOCX, and TXT buffers.
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const logger = require('../utils/logger');

/**
 * Extracts raw textual content from uploaded resume buffer.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - MIME type of the file
 * @param {string} originalName - Name of the file for extension checking
 * @returns {Promise<{ text: string, wordCount: number, format: string }>}
 */
async function parseDocument(buffer, mimeType, originalName = '') {
  if (!buffer || buffer.length === 0) {
    throw new Error('Uploaded document buffer is empty.');
  }

  const ext = originalName.split('.').pop().toLowerCase();
  let text = '';
  let format = 'unknown';

  try {
    if (mimeType === 'application/pdf' || ext === 'pdf') {
      format = 'pdf';
      const parsed = await pdfParse(buffer);
      text = parsed.text || '';
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      ext === 'docx'
    ) {
      format = 'docx';
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } else if (
      mimeType === 'text/plain' ||
      mimeType === 'text/markdown' ||
      ext === 'txt' ||
      ext === 'md'
    ) {
      format = 'txt';
      text = buffer.toString('utf-8');
    } else {
      // Fallback: try text decode
      try {
        text = buffer.toString('utf-8');
        format = 'text-fallback';
      } catch {
        throw new Error(`Unsupported document format (${mimeType || ext}). Please upload PDF, DOCX, or TXT.`);
      }
    }

    // Clean up excessive whitespace and control characters
    const cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 20) {
      throw new Error('Could not extract readable text from the document. The file may be image-only, scanned, or password-protected.');
    }

    const words = cleanedText.split(/\s+/).filter(Boolean);

    logger.debug(`Successfully parsed ${format} document. Word count: ${words.length}`);

    return {
      text: cleanedText,
      wordCount: words.length,
      format,
    };
  } catch (error) {
    logger.error(`Document parse failure (${format}): ${error.message}`);
    throw error;
  }
}

module.exports = {
  parseDocument,
};
