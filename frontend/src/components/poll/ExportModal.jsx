import React, { useState } from 'react'
import { X, FileSpreadsheet, FileText, Download, Printer, CheckCircle } from 'lucide-react'
import apiClient from '../../api/client'

export const ExportModal = ({ isOpen, onClose, poll, results }) => {
  const [downloading, setDownloading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen || !poll) return null

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true)
      const token = localStorage.getItem('token')
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      
      const response = await fetch(`${baseURL}/polls/${poll.id}/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) throw new Error('Failed to export CSV')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `poll_results_${poll.id}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccessMsg('CSV exported successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert('Failed to download CSV: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrintPDF = () => {
    window.print()
  }

  const handleDownloadJSON = () => {
    const exportData = {
      exportTime: new Date().toISOString(),
      poll,
      results,
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', `poll_${poll.id}_data.json`)
    document.body.appendChild(dlAnchor)
    dlAnchor.click()
    dlAnchor.remove()

    setSuccessMsg('JSON data exported!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Download className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Export Poll Results</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="my-5 space-y-3">
          {/* CSV Option */}
          <button
            onClick={handleDownloadCSV}
            disabled={downloading}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  CSV / Excel Spreadsheet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full breakdown of options, vote counts, and percentages
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
          </button>

          {/* Printable / PDF Option */}
          <button
            onClick={handlePrintPDF}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  Print / Save PDF Report
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formatted summary layout ready for presentation or print
                </p>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
          </button>

          {/* JSON Option */}
          <button
            onClick={handleDownloadJSON}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  Raw JSON Data
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Structured JSON payload for programmatic analysis
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
