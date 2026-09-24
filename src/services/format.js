function esSoloFecha(valor) {
  return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor);
}

// Un string solo fecha (AAAA-MM-DD, como el de <input type="date">) lo interpreta
// JS como medianoche UTC; al renderizarlo en hora local aparece un día antes.
// Por eso las fechas sin hora se parsean como local y se muestran solo el día.
export function formatFecha(iso) {
  try {
    if (esSoloFecha(iso)) {
      return new Date(`${iso}T00:00:00`).toLocaleDateString('es', { dateStyle: 'medium' });
    }
    return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}