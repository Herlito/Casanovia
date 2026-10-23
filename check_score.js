const doc = require('./query_api.json').design.document;
function getDesignScore(doc) {
  if (!doc || !doc.pages?.[0]?.elements) return 0;
  const elements = doc.pages[0].elements;
  let score = elements.length * 10;
  elements.forEach((el) => {
    if (el.type === 'image' && el.content?.src) score += 50;
    if (el.type === 'image-frame' && el.content?.imageSrc) score += 60;
    if (el.type === 'svg-shape') score += 20;
    if (el.style?.fontFamily && !['Montserrat', 'sans-serif'].includes(el.style.fontFamily)) score += 15;
  });
  const timestamp = doc.metadata?.lastModified || doc.metadata?.createdAt || doc.updatedAt || 0;
  if (timestamp > 0) score += 5;
  return score;
}
console.log('Score of published design:', getDesignScore(doc));
