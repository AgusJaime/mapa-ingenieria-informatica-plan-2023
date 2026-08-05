import * as XLSX from 'xlsx';
import { calculateStatus } from './graphUtils';

export function exportToExcel(subjectsData, userState, simulationState) {
  const statusMap = {
    'promocionada': 'Aprobada / Promocionada',
    'cursada': 'Cursada',
    'disponible': 'Disponible',
    'nodisponible': 'No Disponible',
    'simulada': 'Proyectada (Simulación)'
  };

  const dataToExport = subjectsData.map(sub => {
    const st = calculateStatus(sub, userState, simulationState, subjectsData);
    return {
      'Código': sub.id,
      'Materia': sub.name,
      'Año': sub.year === 0 ? 'Transversal' : `${sub.year}° Año`,
      'Cuatrimestre': sub.semester === 0 ? '-' : (sub.semester % 2 === 1 ? '1er Cuatrimestre' : '2do Cuatrimestre'),
      'Estado': statusMap[st] || st,
      'Nota Final': userState[sub.id]?.grade || '-',
      'Anotaciones': userState[sub.id]?.note || '-'
    };
  });

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  
  // Anchos de columna
  ws['!cols'] = [
    {wch: 8},   // Código
    {wch: 45},  // Materia
    {wch: 12},  // Año
    {wch: 20},  // Cuatrimestre
    {wch: 25},  // Estado
    {wch: 15},  // Nota Final
    {wch: 35}   // Anotaciones
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Progreso UNLaM");
  XLSX.writeFile(wb, "Progreso_UNLaM_Informatica.xlsx");
}
