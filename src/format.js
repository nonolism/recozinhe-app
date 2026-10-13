// Funções pequenas de formatação usadas em várias telas

// 2.4 -> "2,4kg"
export function formatKg(value) {
  const number = Number(value || 0);
  return `${number.toFixed(1).replace('.', ',')}kg`;
}

// Receita -> "20 min - Fácil"
export function recipeMeta(recipe) {
  return `${recipe.prep_time_minutes} min - ${recipe.difficulty_display}`;
}

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

// "2026-09-10T..." -> "SET/2026"
export function monthYear(isoDate) {
  if (!isoDate) return '';
  const [year, month] = isoDate.slice(0, 7).split('-');
  return `${MONTHS[Number(month) - 1]}/${year}`;
}

// "2026-10-05T14:30:00..." -> "05/10/2026"
export function shortDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
