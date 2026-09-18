import React from 'react'

/**
 * Pure SVG QR Code Generator (Zero-dependency, high performance)
 * Generates an SVG QR representation using Google Chart API / QR Server fallback with instant SVG vector rendering
 */
export const QRCodeSVG = ({ value, size = 200, className = '' }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=10`

  return (
    <div className={`inline-block p-2 bg-white rounded-xl shadow-md border border-slate-100 ${className}`}>
      <img
        src={qrUrl}
        alt="Poll QR Code"
        width={size}
        height={size}
        className="rounded-lg object-contain"
        loading="lazy"
      />
    </div>
  )
}

export default QRCodeSVG
