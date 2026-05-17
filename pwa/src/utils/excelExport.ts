import { utils, write, type WorkBook } from 'xlsx';
import type { ReportEntry } from '../types';

/**
 * Export attendance data to Excel and trigger browser download
 */
export async function exportToExcel(
  data: ReportEntry[],
  employeeName: string,
  period: string,
) {
  try {
    const fileName = `Attendance_${employeeName.replace(/\s/g, '_')}_${period.replace(/\s/g, '_')}.xlsx`;

    // Map data to Excel format
    const rows = data.map((item) => ({
      Date: item.date,
      Day: item.day,
      Branch: item.branch,
      'Clock In': item.clockIn,
      'Clock Out': item.clockOut,
      'Break (Auto)': item.breakDuration,
      'Worked Hours': item.workedHours,
      'Overtime Hours': item.overtimeHours,
      Flags: item.flags.join(', '),
      Type: item.isFriday ? 'Day Off Visit' : 'Regular',
    }));

    const ws = utils.json_to_sheet(rows);
    const wb: WorkBook = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Attendance');

    // Generate binary string
    const wbout = write(wb, { type: 'array', bookType: 'xlsx' });
    
    // Create Blob and Download link
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    return false;
  }
}
