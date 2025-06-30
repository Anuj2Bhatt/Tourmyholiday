// ===== EMOJI SUPPORT FUNCTIONS =====
// These functions will help render emojis in PDF

// Function to render emoji to canvas and convert to base64
export const renderEmojiToCanvas = (emoji, size = 20) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    // Set background to transparent
    ctx.clearRect(0, 0, size, size);
    
    // Try different emoji fonts
    const fonts = [
      'Segoe UI Emoji',
      'Noto Color Emoji', 
      'Apple Color Emoji',
      'Twemoji Mozilla',
      'EmojiOne Color',
      'Arial'
    ];
    
    let fontIndex = 0;
    const tryFont = () => {
      if (fontIndex >= fonts.length) {
        return;
      }
      
      ctx.font = `${size}px "${fonts[fontIndex]}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';
      
      // Measure text to check if emoji rendered
      const metrics = ctx.measureText(emoji);
      if (metrics.width > 0) {
        ctx.fillText(emoji, size/2, size/2);
      } else {
        fontIndex++;
        tryFont();
      }
    };
    
    tryFont();
    return canvas.toDataURL('image/png');
  } catch (error) {
    return null;
  }
};

// Function to add emoji to PDF
export const addEmojiToPDF = (pdf, emoji, x, y, size = 20) => {
  try {
    const emojiImage = renderEmojiToCanvas(emoji, size);
    if (emojiImage) {
      pdf.addImage(emojiImage, 'PNG', x, y, size, size);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Function to detect emojis in text
export const detectEmojis = (text) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1FAB0}-\u{1FABF}]|[\u{1FAC0}-\u{1FAFF}]|[\u{1FAD0}-\u{1FAFF}]|[\u{1FAE0}-\u{1FAFF}]|[\u{1FAF0}-\u{1FAFF}]/gu;
  return text.match(emojiRegex) || [];
};

// Function to split text with emojis
export const splitTextWithEmojis = (text) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1FAB0}-\u{1FABF}]|[\u{1FAC0}-\u{1FAFF}]|[\u{1FAD0}-\u{1FAFF}]|[\u{1FAE0}-\u{1FAFF}]|[\u{1FAF0}-\u{1FAFF}]/gu;
  return text.split(emojiRegex);
};

// Function to render text with emojis in PDF
export const renderTextWithEmojis = (pdf, text, x, y, fontSize = 12, maxWidth = null) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1FAB0}-\u{1FABF}]|[\u{1FAC0}-\u{1FAFF}]|[\u{1FAD0}-\u{1FAFF}]|[\u{1FAE0}-\u{1FAFF}]|[\u{1FAF0}-\u{1FAFF}]/gu;
  
  if (!emojiRegex.test(text)) {
    // No emojis, render normal text
    if (maxWidth) {
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line, index) => {
        pdf.text(line, x, y + (index * fontSize * 0.35));
      });
    } else {
      pdf.text(text, x, y);
    }
    return;
  }
  
  // Split text into parts (text and emoji)
  const parts = text.split(emojiRegex);
  const emojis = text.match(emojiRegex) || [];
  
  let currentX = x;
  const emojiSize = fontSize * 1.2; // Emoji size relative to font size
  
  parts.forEach((part, index) => {
    if (part) {
      // Render text part
      pdf.text(part, currentX, y);
      currentX += pdf.getTextWidth(part);
    }
    
    if (emojis[index]) {
      // Render emoji
      addEmojiToPDF(pdf, emojis[index], currentX, y - emojiSize * 0.8, emojiSize);
      currentX += emojiSize;
    }
  });
};

// Function to render title with emojis in PDF
export const renderTitleWithEmojis = (pdf, text, x, y, fontSize = 56, align = 'center') => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1FAB0}-\u{1FABF}]|[\u{1FAC0}-\u{1FAFF}]|[\u{1FAD0}-\u{1FAFF}]|[\u{1FAE0}-\u{1FAFF}]|[\u{1FAF0}-\u{1FAFF}]/gu;
  
  if (!emojiRegex.test(text)) {
    // No emojis, render normal text
    pdf.text(text, x, y, { align: align });
    return;
  }
  
  // Split text into parts (text and emoji)
  const parts = text.split(emojiRegex);
  const emojis = text.match(emojiRegex) || [];
  
  // Calculate total width for centering
  let totalWidth = 0;
  const emojiSize = fontSize * 1.2;
  
  parts.forEach((part, index) => {
    if (part) {
      totalWidth += pdf.getTextWidth(part);
    }
    if (emojis[index]) {
      totalWidth += emojiSize;
    }
  });
  
  // Calculate starting position for centering
  let currentX = align === 'center' ? x - totalWidth / 2 : x;
  
  parts.forEach((part, index) => {
    if (part) {
      // Render text part
      pdf.text(part, currentX, y);
      currentX += pdf.getTextWidth(part);
    }
    
    if (emojis[index]) {
      // Render emoji
      addEmojiToPDF(pdf, emojis[index], currentX, y - emojiSize * 0.8, emojiSize);
      currentX += emojiSize;
    }
  });
};

// ===== END EMOJI SUPPORT FUNCTIONS ===== 