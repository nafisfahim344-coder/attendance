import { utils, write, type WorkBook } from 'xlsx';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import type { ReportEntry } from '../types';

/**
 * Export attendance data to Excel and trigger share dialog
 */
export async function exportToExcel(
  data: ReportEntry[],
  employeeName: string,
  period: string,
) {
  try {
    const fileName = `Attendance_${employeeName.replace(/\s/g, '_')}_${period.replace(/\s/g, '_')}.xlsx`;
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

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

    const wbout = write(wb, { type: 'base64', bookType: 'xlsx' });

    await RNFS.writeFile(path, wbout, 'base64');

    await Share.open({
      title: 'Export Attendance Report',
      url: `file://${path}`,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      failOnCancel: false,
    });

    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    return false;
  }
}
