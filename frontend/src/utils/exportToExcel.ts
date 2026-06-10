import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface ExportOptions {
  data: Record<string, unknown>[]
  sheetName?: string
  fileName?: string
}

export function exportToExcel({ data, sheetName = 'Sheet1', fileName }: ExportOptions) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${fileName || sheetName.toLowerCase()}_${Date.now()}.xlsx`)
}
