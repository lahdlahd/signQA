function transformInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function convertMdxToHtml(mdx) {
  if (!mdx) {
    return '';
  }

  const lines = mdx.trim().split(/\r?\n/);
  let html = '';
  let inList = false;

  const flushList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      html += `<h2>${transformInline(line.slice(3).trim())}</h2>`;
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      html += `<h3>${transformInline(line.slice(4).trim())}</h3>`;
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${transformInline(line.slice(2).trim())}</li>`;
      continue;
    }

    flushList();
    html += `<p>${transformInline(line)}</p>`;
  }

  flushList();
  return html;
}
