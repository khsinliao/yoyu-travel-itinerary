
import { DayItinerary, Expense } from '../types';

export const exportToCSV = (title: string, itinerary: DayItinerary[], expenses: Expense[]) => {
  // 1. Prepare CSV Content
  // We use \uFEFF (BOM) to ensure Excel opens the file with UTF-8 encoding (supporting Chinese)
  let csvContent = "\uFEFF";

  // --- Part 1: Itinerary ---
  csvContent += "行程規劃 Itinerary\n";
  csvContent += "日期,星期,地點,時間,活動名稱,類型,詳細說明,備註,預算/花費\n";

  itinerary.forEach(day => {
    // Day Header Row (Optional, but helps readablity)
    // csvContent += `${day.date},${day.displayDate},${day.location},ALL DAY,---,DAY HEADER,,,\n`;

    day.activities.forEach(act => {
      // Handle fields that might contain commas by wrapping in quotes
      const escape = (text?: string) => {
        if (!text) return "";
        return `"${text.replace(/"/g, '""')}"`; // Escape double quotes
      };

      const row = [
        day.date,
        day.displayDate.split('(')[1]?.replace(')', '') || '',
        escape(act.location || day.location),
        escape(act.time),
        escape(act.title),
        act.type,
        escape(act.description),
        escape(act.notes),
        "" // Placeholder for cost if linked in future
      ].join(",");
      csvContent += row + "\n";
    });
  });

  csvContent += "\n\n";

  // --- Part 2: Expenses ---
  csvContent += "消費紀錄 Expenses\n";
  csvContent += "日期,項目,類別,幣別,金額,匯率換算(約)\n";

  expenses.forEach(exp => {
    const escape = (text?: string) => {
      if (!text) return "";
      return `"${text.replace(/"/g, '""')}"`;
    };

    const row = [
      exp.date,
      escape(exp.description),
      exp.category,
      exp.currency,
      exp.amount,
      exp.currency === 'JPY' ? `NT$ ${(exp.amount * 0.22).toFixed(0)}` : `¥ ${(exp.amount / 0.22).toFixed(0)}`
    ].join(",");
    csvContent += row + "\n";
  });

  // 2. Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title}_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
