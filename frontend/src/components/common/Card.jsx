import React from 'react'

export const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 transition-all duration-200 ${
        hover ? 'hover:border-slate-600/80 hover:shadow-xl hover:shadow-emerald-950/20 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
