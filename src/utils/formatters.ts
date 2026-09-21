export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const getMonthLabel = (monthYear: string): string => {
  if (!monthYear || !monthYear.includes('-')) return monthYear;
  const [yearStr, monthStr] = monthYear.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex] || monthStr;
  return `${monthName} de ${yearStr}`;
};

export const getShortMonthLabel = (monthYear: string): string => {
  if (!monthYear || !monthYear.includes('-')) return monthYear;
  const [yearStr, monthStr] = monthYear.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex] || monthStr;
  return `${monthName.substring(0, 3)}/${yearStr.substring(2)}`;
};

export const getAdjacentMonth = (monthYear: string, offset: number): string => {
  const [yearStr, monthStr] = monthYear.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month += offset;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  const paddedMonth = month.toString().padStart(2, '0');
  return `${year}-${paddedMonth}`;
};

export const isPastMonth = (monthYear: string, currentMonthYear: string): boolean => {
  return monthYear < currentMonthYear;
};
