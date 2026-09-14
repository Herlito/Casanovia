import { BudgetItem, VendorItem } from '../types';

export type BudgetCategoryType = 
  | 'locacion_banquete' 
  | 'fotografia_video' 
  | 'musica_iluminacion' 
  | 'floristeria_decoracion' 
  | 'vestuario_belleza' 
  | 'papeleria_recuerdos' 
  | 'protocolo_detalles' 
  | 'otros';

/**
 * Maps a Vendor category to the corresponding BudgetItem category
 */
export function mapVendorCategoryToBudgetCategory(vendorCategory: string): BudgetCategoryType {
  const cat = (vendorCategory || '').toLowerCase();
  
  if (
    cat.includes('banquet') || 
    cat.includes('locaci') || 
    cat.includes('local') || 
    cat.includes('hacienda') || 
    cat.includes('catering') || 
    cat.includes('bebida') ||
    cat.includes('pastel') ||
    cat.includes('dulce')
  ) {
    return 'locacion_banquete';
  }
  
  if (
    cat.includes('fotograf') || 
    cat.includes('video') || 
    cat.includes('drone') || 
    cat.includes('visual') ||
    cat.includes('cinema')
  ) {
    return 'fotografia_video';
  }
  
  if (
    cat.includes('músic') || 
    cat.includes('music') || 
    cat.includes('dj') || 
    cat.includes('orquest') || 
    cat.includes('apdayc') ||
    cat.includes('sonido') || 
    cat.includes('iluminaci') || 
    cat.includes('audio')
  ) {
    return 'musica_iluminacion';
  }
  
  if (
    cat.includes('flor') || 
    cat.includes('decoraci') || 
    cat.includes('mobiliario') ||
    cat.includes('ambientaci') || 
    cat.includes('botánic') || 
    cat.includes('arco')
  ) {
    return 'floristeria_decoracion';
  }
  
  if (
    cat.includes('vest') || 
    cat.includes('traje') || 
    cat.includes('novia') || 
    cat.includes('novio') || 
    cat.includes('belleza') || 
    cat.includes('maquillaj') || 
    cat.includes('peinado') || 
    cat.includes('joyer') || 
    cat.includes('anillo')
  ) {
    return 'vestuario_belleza';
  }
  
  if (
    cat.includes('papeler') || 
    cat.includes('invitaci') || 
    cat.includes('recuerdo') || 
    cat.includes('souvenir') || 
    cat.includes('caligraf')
  ) {
    return 'papeleria_recuerdos';
  }
  
  if (
    cat.includes('protocol') || 
    cat.includes('coordinaci') || 
    cat.includes('planner') || 
    cat.includes('wedging') ||
    cat.includes('wedding') ||
    cat.includes('iglesia') ||
    cat.includes('municipalidad') ||
    cat.includes('transport') || 
    cat.includes('movilidad') || 
    cat.includes('show') || 
    cat.includes('horaloca') ||
    cat.includes('hora loca') || 
    cat.includes('mariachi')
  ) {
    return 'protocolo_detalles';
  }
  
  return 'otros';
}

/**
 * Builds budget items exclusively from the given vendors, removing any fictitious/orphaned items.
 */
export function buildBudgetDirectlyFromVendors(vendors: VendorItem[]): BudgetItem[] {
  return vendors.map((vendor, index) => {
    const bCategory = vendor.category || 'Otros Servicios';
    const cost = Number(vendor.totalCost) || 0;
    const paid = Number(vendor.paidAmount) || 0;

    let status: 'pending' | 'partial' | 'paid' = 'pending';
    if (vendor.status === 'liquidado' || (paid >= cost && cost > 0)) {
      status = 'paid';
    } else if (vendor.status === 'contratado' && paid > 0) {
      status = 'partial';
    } else if (paid > 0) {
      status = 'partial';
    }

    const contactInfo = [vendor.contactPerson, vendor.phone, vendor.email].filter(Boolean).join(' • ');
    const noteText = vendor.notes 
      ? vendor.notes 
      : contactInfo 
      ? `Contacto: ${contactInfo}`
      : `Servicio de ${vendor.category} registrado en Proveedores.`;

    return {
      id: `b-v-${vendor.id || index + 1}`,
      category: bCategory,
      concept: `${vendor.name} (${vendor.category})`,
      vendor: vendor.name,
      vendorId: vendor.id,
      estimatedCost: cost,
      actualCost: cost,
      paidAmount: paid,
      status,
      notes: noteText,
    };
  });
}

/**
 * Creates or updates budget items based on registered vendors
 */
export function syncVendorsIntoBudget(
  currentBudget: BudgetItem[],
  vendors: VendorItem[]
): BudgetItem[] {
  // If user has registered vendors, map directly to eliminate fictitious/dummy items
  if (vendors && vendors.length > 0) {
    return buildBudgetDirectlyFromVendors(vendors);
  }
  return currentBudget;
}

