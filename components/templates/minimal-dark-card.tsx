'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import type { BusinessCard } from '@/lib/types'
import { ensureHttps } from '@/lib/utils'

export function MinimalDarkCard({ card }: { card: BusinessCard }) {
  const reduce = useReducedMotion()
  return (
    <div style={{ minHeight: '100dvh', background: '#0f0f0f', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', maxWidth: 480, margin: '0 auto' }}>
      <motion.div style={{ width: '100%' }} initial={reduce ? {} : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', border: '2px solid #262626', marginBottom: 16, position: 'relative' }}>
            {card.profile_image_url ? (
              <Image src={card.profile_image_url} alt={card.name} fill className="object-cover" />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
            )}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f5f5f5', marginBottom: 4 }}>{card.name}</h1>
          <p style={{ fontSize: 13, color: '#737373' }}>{card.position} · {card.company_name}</p>
          {card.short_intro && <p style={{ fontSize: 13, color: '#525252', marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>{card.short_intro}</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {card.phone && <a href={`tel:${card.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, padding: '0 20px', background: '#1c1c1c', border: '1px solid #262626', borderRadius: 16, textDecoration: 'none', color: '#a3a3a3', fontSize: 13 }}><span>📞 {card.phone}</span><span>›</span></a>}
          {card.email && <a href={`mailto:${card.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, padding: '0 20px', background: '#1c1c1c', border: '1px solid #262626', borderRadius: 16, textDecoration: 'none', color: '#a3a3a3', fontSize: 13 }}><span>✉️ {card.email}</span><span>›</span></a>}
          {card.instagram_url && <a href={ensureHttps(card.instagram_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, padding: '0 20px', background: '#1c1c1c', border: '1px solid #262626', borderRadius: 16, textDecoration: 'none', color: '#a3a3a3', fontSize: 13 }}><span>📸 Instagram</span><span>›</span></a>}
          {card.website_url && <a href={ensureHttps(card.website_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, padding: '0 20px', background: '#1c1c1c', border: '1px solid #262626', borderRadius: 16, textDecoration: 'none', color: '#a3a3a3', fontSize: 13 }}><span>🌐 {card.website_url.replace(/^https?:\/\//, '')}</span><span>›</span></a>}
        </div>
      </motion.div>
    </div>
  )
}
