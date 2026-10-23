import fs from 'fs';
import path from 'path';

// Dusty blue watercolor floral SVG definitions
const floralCrestSvg = `<svg viewBox="0 0 500 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g opacity="0.92">
    <!-- Center blue rose cluster -->
    <circle cx="250" cy="55" r="32" fill="#8CAAC8" fill-opacity="0.35" />
    <circle cx="245" cy="50" r="22" fill="#5A7D9E" fill-opacity="0.5" />
    <circle cx="252" cy="46" r="14" fill="#3D5F80" fill-opacity="0.6" />
    <path d="M230 55 C235 42, 265 42, 270 55 C275 70, 225 70, 230 55 Z" fill="#9FB9D0" fill-opacity="0.4" />
    
    <!-- Left rose -->
    <circle cx="205" cy="65" r="24" fill="#AAC3E3" fill-opacity="0.5" />
    <circle cx="202" cy="62" r="16" fill="#6A8CAE" fill-opacity="0.55" />
    <circle cx="206" cy="60" r="10" fill="#4B6E90" fill-opacity="0.65" />

    <!-- Right rose -->
    <circle cx="295" cy="65" r="24" fill="#AAC3E3" fill-opacity="0.5" />
    <circle cx="298" cy="62" r="16" fill="#6A8CAE" fill-opacity="0.55" />
    <circle cx="294" cy="60" r="10" fill="#4B6E90" fill-opacity="0.65" />

    <!-- Eucalyptus & sage foliage left -->
    <path d="M185 68 C155 60, 140 75, 120 70 C140 85, 165 80, 185 72 Z" fill="#8A9D87" fill-opacity="0.55" />
    <path d="M160 55 C135 45, 115 55, 95 48 C115 65, 140 60, 160 55 Z" fill="#A3B4A0" fill-opacity="0.6" />
    <ellipse cx="140" cy="58" rx="14" ry="7" transform="rotate(-20 140 58)" fill="#7E937B" fill-opacity="0.5" />
    <ellipse cx="170" cy="74" rx="12" ry="6" transform="rotate(15 170 74)" fill="#95A793" fill-opacity="0.5" />

    <!-- Eucalyptus & sage foliage right -->
    <path d="M315 68 C345 60, 360 75, 380 70 C360 85, 335 80, 315 72 Z" fill="#8A9D87" fill-opacity="0.55" />
    <path d="M340 55 C365 45, 385 55, 405 48 C385 65, 360 60, 340 55 Z" fill="#A3B4A0" fill-opacity="0.6" />
    <ellipse cx="360" cy="58" rx="14" ry="7" transform="rotate(20 360 58)" fill="#7E937B" fill-opacity="0.5" />
    <ellipse cx="330" cy="74" rx="12" ry="6" transform="rotate(-15 330 74)" fill="#95A793" fill-opacity="0.5" />

    <!-- Delphinium & hydrangea florets -->
    <circle cx="230" cy="30" r="7" fill="#BED4E6" fill-opacity="0.7" />
    <circle cx="270" cy="30" r="7" fill="#BED4E6" fill-opacity="0.7" />
    <circle cx="250" cy="22" r="6" fill="#AAC3E3" fill-opacity="0.8" />
    <circle cx="218" cy="40" r="5" fill="#BED4E6" fill-opacity="0.65" />
    <circle cx="282" cy="40" r="5" fill="#BED4E6" fill-opacity="0.65" />
    
    <!-- Delicate trailing stems -->
    <path d="M250 85 C250 110, 246 125, 244 135" stroke="#7A9178" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6" />
    <ellipse cx="243" cy="115" rx="6" ry="3" transform="rotate(-30 243 115)" fill="#8A9D87" fill-opacity="0.6" />
    <ellipse cx="247" cy="128" rx="5" ry="2.5" transform="rotate(25 247 128)" fill="#8A9D87" fill-opacity="0.6" />
  </g>
</svg>`;

const sideFloralBouquetSvg = `<svg viewBox="0 0 160 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g opacity="0.9">
    <ellipse cx="80" cy="150" rx="36" ry="36" fill="#8CAAC8" fill-opacity="0.35" />
    <circle cx="76" cy="146" r="22" fill="#5A7D9E" fill-opacity="0.5" />
    <circle cx="82" cy="142" r="13" fill="#3D5F80" fill-opacity="0.6" />
    
    <circle cx="65" cy="105" r="20" fill="#AAC3E3" fill-opacity="0.45" />
    <circle cx="63" cy="102" r="12" fill="#6A8CAE" fill-opacity="0.5" />
    
    <circle cx="88" cy="195" r="20" fill="#BED4E6" fill-opacity="0.5" />
    <circle cx="85" cy="192" r="12" fill="#5A7D9E" fill-opacity="0.5" />
    
    <!-- Leaves -->
    <path d="M60 75 C40 50, 25 55, 10 40 C30 65, 45 75, 60 75 Z" fill="#8A9D87" fill-opacity="0.6" />
    <ellipse cx="35" cy="55" rx="14" ry="7" transform="rotate(-35 35 55)" fill="#7E937B" fill-opacity="0.5" />
    <path d="M75 225 C60 250, 40 265, 25 280 C45 260, 60 245, 75 225 Z" fill="#8A9D87" fill-opacity="0.6" />
    <ellipse cx="45" cy="255" rx="14" ry="7" transform="rotate(35 45 255)" fill="#7E937B" fill-opacity="0.5" />
  </g>
</svg>`;

const document0919 = {
  id: 'doc_0919_juanyjuana',
  parentEventId: '0919-juanyjuana',
  metadata: {
    createdAt: 1726704000000,
    lastModified: Date.now(),
    version: '2.5.0'
  },
  canvas: {
    width: 720,
    height: 2400,
    backgroundColor: '#F5F2EB',
    webBackgroundColor: '#AAC3E3',
    borderRadius: 0
  },
  theme: {
    id: 'editorial-dusty-blue',
    name: 'Serenidad Azul & Lino',
    palette: {
      background: '#F5F2EB',
      primary: '#2C4460',
      secondary: '#4A6572',
      accent: '#8CAAC8'
    }
  },
  pages: [
    {
      id: 'page-1',
      name: 'Página Principal',
      elements: [
        // 1. Top Arch Frame
        {
          id: 'arch-frame-01',
          type: 'svg-shape',
          transform: { x: 60, y: 35, width: 600, height: 420, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fill: '#FDFBF7',
            stroke: '#8CAAC8',
            strokeWidth: 1.5,
            borderRadius: 280,
            opacity: 0.95
          },
          zIndex: 1
        },
        // 2. Floral crest top of arch
        {
          id: 'top-floral-crest',
          type: 'decorative-element',
          transform: { x: 160, y: 12, width: 400, height: 110, rotation: 0, scaleX: 1, scaleY: 1 },
          content: {
            svgCode: floralCrestSvg
          },
          style: { opacity: 0.95 },
          zIndex: 2
        },
        // 3. Header Tag ("NUESTRA BODA")
        {
          id: 'header-tag-01',
          type: 'text',
          content: { text: 'NUESTRA BODA' },
          transform: { x: 60, y: 68, width: 600, height: 24, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 13,
            fontWeight: 'bold',
            letterSpacing: 5,
            color: '#5A738E',
            align: 'center',
            textTransform: 'uppercase'
          },
          dataBinding: { field: 'headerTag' },
          zIndex: 3
        },
        // 4. Couple Names ("Juan & Juana")
        {
          id: 'couple-names-01',
          type: 'text',
          content: { text: 'Juan & Juana' },
          transform: { x: 60, y: 98, width: 600, height: 75, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Great Vibes',
            fontSize: 62,
            color: '#2C4460',
            align: 'center'
          },
          dataBinding: { field: 'coupleNames', format: '{{0}} & {{1}}' },
          zIndex: 4
        },
        // 5. Event Date ("sábado, 19 de septiembre de 2026")
        {
          id: 'event-date-01',
          type: 'text',
          content: { text: 'sábado, 19 de septiembre de 2026' },
          transform: { x: 60, y: 182, width: 600, height: 26, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Cormorant Garamond',
            fontSize: 18,
            color: '#4A6572',
            align: 'center'
          },
          dataBinding: { field: 'eventDate' },
          zIndex: 5
        },
        // 6. Venue Name ("JARDINES DE SABANDIA")
        {
          id: 'venue-name-01',
          type: 'text',
          content: { text: 'JARDINES DE SABANDIA' },
          transform: { x: 60, y: 216, width: 600, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 16,
            fontWeight: 'bold',
            letterSpacing: 4,
            color: '#2C4460',
            align: 'center',
            textTransform: 'uppercase'
          },
          dataBinding: { field: 'venueName' },
          zIndex: 6
        },
        // 7. Romantic Quote
        {
          id: 'romantic-quote-01',
          type: 'text',
          content: {
            text: '"Y RECUERDA, TAL Y COMO ESTABA ESCRITO, QUE QUERER A OTRA PERSONA ES VER LA CARA DE DIOS. QUERER A ALGUIEN Y QUE NOS QUIERAN ES LA SENSACIÓN MÁS GRATIFICANTE QUE PODEMOS SENTIR LOS SERES HUMANOS"'
          },
          transform: { x: 80, y: 258, width: 560, height: 110, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Cormorant Garamond',
            fontSize: 13,
            fontStyle: 'italic',
            color: '#5A6B7C',
            align: 'center',
            lineHeight: 1.6
          },
          dataBinding: { field: 'romanticQuote' },
          zIndex: 7
        },
        // 8. Couple Photo (Juan & Juana)
        {
          id: 'couple-photo-01',
          type: 'image',
          content: {
            src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80',
            alt: 'Juan & Juana'
          },
          transform: { x: 155, y: 480, width: 410, height: 390, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            borderRadius: 24,
            objectFit: 'cover'
          },
          zIndex: 8
        },
        // 9. Left floral accent for photo
        {
          id: 'floral-accent-left',
          type: 'decorative-element',
          transform: { x: 75, y: 610, width: 100, height: 180, rotation: 0, scaleX: 1, scaleY: 1 },
          content: { svgCode: sideFloralBouquetSvg },
          style: { opacity: 0.9 },
          zIndex: 9
        },
        // 10. Right floral accent for photo (flipped)
        {
          id: 'floral-accent-right',
          type: 'decorative-element',
          transform: { x: 545, y: 610, width: 100, height: 180, rotation: 0, scaleX: -1, scaleY: 1 },
          content: { svgCode: sideFloralBouquetSvg },
          style: { opacity: 0.9 },
          zIndex: 10
        },
        // 11. "Our love story" Heading
        {
          id: 'love-story-heading',
          type: 'text',
          content: { text: 'Our love story' },
          transform: { x: 60, y: 895, width: 600, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Great Vibes',
            fontSize: 46,
            color: '#2C4460',
            align: 'center'
          },
          zIndex: 11
        },
        // 12. "CUENTA REGRESIVA" Title
        {
          id: 'countdown-heading',
          type: 'text',
          content: { text: 'CUENTA REGRESIVA' },
          transform: { x: 60, y: 960, width: 600, height: 24, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 4,
            color: '#5A738E',
            align: 'center',
            textTransform: 'uppercase'
          },
          zIndex: 12
        },
        // 13. Countdown Widget Cards
        {
          id: 'countdown-widget-01',
          type: 'countdown-widget',
          content: {
            targetDate: '2026-09-19T12:00:00.000Z',
            title: 'CUENTA REGRESIVA',
            expiredMessage: '¡Llegó el gran día!',
            labels: { days: 'DÍAS', hours: 'HORAS', minutes: 'MIN', seconds: 'SEG' }
          },
          transform: { x: 110, y: 995, width: 500, height: 86, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            backgroundColor: '#FFFFFF',
            borderColor: '#CBD5E1',
            numberColor: '#2C4460',
            labelColor: '#5A738E',
            borderRadius: 16
          },
          zIndex: 13
        },
        // 14. Countdown Subtitle ("¡ESPERAMOS CELEBRAR ESTE GRAN DÍA CONTIGO!")
        {
          id: 'countdown-subtext',
          type: 'text',
          content: { text: '¡ESPERAMOS CELEBRAR ESTE GRAN DÍA CONTIGO!' },
          transform: { x: 60, y: 1098, width: 600, height: 28, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Cormorant Garamond',
            fontSize: 16,
            fontStyle: 'italic',
            color: '#5A6B7C',
            align: 'center',
            letterSpacing: 1
          },
          zIndex: 14
        },
        // 15. Reception & Party Card ("FUNDO PARAÍSO")
        {
          id: 'event-reception-card-01',
          type: 'event-reception-card',
          content: {
            badge: '🥂 Recepción & Fiesta',
            venueName: 'FUNDO PARAÍSO',
            time: '12:00',
            address: 'Alto Selva Alegre',
            googleMapsUrl: 'https://maps.google.com/?q=Alto+Selva+Alegre+Arequipa',
            wazeUrl: 'https://waze.com/ul?q=Alto+Selva+Alegre+Arequipa'
          },
          transform: { x: 70, y: 1150, width: 580, height: 290, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            backgroundColor: '#FFFFFF',
            borderColor: '#D0DFEE',
            strokeWidth: 1,
            borderRadius: 24,
            titleColor: '#1E354D',
            accentColor: '#4A6B8A',
            color: '#526477',
            align: 'center'
          },
          zIndex: 15
        },
        // 16. RSVP Card Container Background
        {
          id: 'rsvp-card-bg',
          type: 'svg-shape',
          transform: { x: 70, y: 1470, width: 580, height: 230, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fill: '#FFFFFF',
            stroke: '#D0DFEE',
            strokeWidth: 1,
            borderRadius: 24
          },
          zIndex: 16
        },
        // 17. RSVP Title "R . S . V . P"
        {
          id: 'rsvp-title',
          type: 'text',
          content: { text: 'R . S . V . P' },
          transform: { x: 70, y: 1495, width: 580, height: 34, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Playfair Display',
            fontSize: 24,
            fontWeight: 'bold',
            letterSpacing: 8,
            color: '#2C4460',
            align: 'center'
          },
          zIndex: 17
        },
        // 18. RSVP Heart "♡"
        {
          id: 'rsvp-heart',
          type: 'text',
          content: { text: '♡' },
          transform: { x: 70, y: 1535, width: 580, height: 24, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Cormorant Garamond',
            fontSize: 20,
            color: '#4A6B8A',
            align: 'center'
          },
          zIndex: 18
        },
        // 19. RSVP Button "✉ Confirmar Asistencia"
        {
          id: 'rsvp-cta-btn',
          type: 'interactive-button',
          content: {
            text: '✉ Confirmar Asistencia',
            actionType: 'rsvp',
            linkUrl: '#rsvp-section'
          },
          transform: { x: 160, y: 1572, width: 400, height: 52, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            backgroundColor: '#4A6B8A',
            color: '#FFFFFF',
            borderRadius: 20,
            fontFamily: 'Montserrat',
            fontSize: 15,
            fontWeight: 'bold'
          },
          zIndex: 19
        },
        // 20. RSVP Subtext Deadline
        {
          id: 'rsvp-deadline-text',
          type: 'text',
          content: { text: 'Favor confirmar antes del 10 de Septiembre' },
          transform: { x: 70, y: 1638, width: 580, height: 22, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 11,
            color: '#718096',
            align: 'center'
          },
          zIndex: 20
        },
        // 21. Dress Code Card
        {
          id: 'dress-code-card-01',
          type: 'dress-code-card',
          content: {
            badge: '👔 Código de Vestimenta',
            styleName: 'Rigurosa Etiqueta / Formal Gala',
            description: 'Agradecemos vestir atuendo formal para acompañarnos en esta celebración tan especial. Damas: Vestido largo de gala. Caballeros: Traje oscuro o smoking formal.',
            suggestedColors: [
              { name: 'Azul Serenidad', hex: '#AAC3E3' },
              { name: 'Azul Medianoche', hex: '#2C4460' },
              { name: 'Champagne', hex: '#D4AF37' },
              { name: 'Gris Plata', hex: '#CBD5E1' }
            ]
          },
          transform: { x: 70, y: 1730, width: 580, height: 430, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            backgroundColor: '#FFFFFF',
            borderColor: '#D0DFEE',
            strokeWidth: 1,
            borderRadius: 24,
            titleColor: '#1E354D',
            accentColor: '#4A6B8A',
            color: '#526477',
            align: 'center'
          },
          zIndex: 21
        },
        // 22. Closing Script Text
        {
          id: 'closing-script-text',
          type: 'text',
          content: { text: '¡Esperamos celebrar este gran día contigo!' },
          transform: { x: 70, y: 2210, width: 580, height: 44, rotation: 0, scaleX: 1, scaleY: 1 },
          style: {
            fontFamily: 'Great Vibes',
            fontSize: 34,
            color: '#2C4460',
            align: 'center'
          },
          zIndex: 22
        }
      ]
    }
  ],
  assetReferences: []
};

// 1. Update public/cpanel-backend/api/data/weddingcraft/published/0919-juanyjuana.json
const pubDir = path.resolve('public/cpanel-backend/api/data/weddingcraft/published');
fs.writeFileSync(path.join(pubDir, '0919-juanyjuana.json'), JSON.stringify(document0919, null, 2), 'utf8');
console.log('Written 0919-juanyjuana.json to public/');

// Also dist/ if exists
const distPubDir = path.resolve('dist/cpanel-backend/api/data/weddingcraft/published');
if (fs.existsSync(distPubDir)) {
  fs.writeFileSync(path.join(distPubDir, '0919-juanyjuana.json'), JSON.stringify(document0919, null, 2), 'utf8');
  console.log('Written 0919-juanyjuana.json to dist/');
}

// 2. Update src/data/publishedDesignsData.json
const registryPath = path.resolve('src/data/publishedDesignsData.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
registry['0919-juanyjuana'] = document0919;

// Delete legacy entries from publishedDesignsData.json if any
delete registry['boda-juan-juana-6429'];
delete registry['juan-juana'];
delete registry['juanyjuana'];

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
console.log('Updated src/data/publishedDesignsData.json');
