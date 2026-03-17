'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Phone, MessageSquare, Mail, Globe, Instagram, ChevronRight } from 'lucide-react'
import type { BusinessCard } from '@/lib/types'
import { ensureHttps } from '@/lib/utils'

interface Props {
  card: BusinessCard
}

export function MinimalDarkCard({ card }: Props) {
  const shouldReduceMotion = useReducedMotion()

  const phoneLink = card.links?.find((l) => l.type === 'phone') ??
    (card.phone ? { url: `tel:${card.phone}`, label: '전화' } : null)
  const emailLink = card.links?.find((l) => l.type === 'email') ??
    (card.email ? { url: `mailto:${card.email}`, label: card.email } : null)
  const instaLink = card.links?.find((l) => l.type === 'instagram') ??
    (card.instagram_url ? { url: card.instagram_url, label: 'Instagram' } : null)
  const siteLink = card.links?.find((l) => l.type === 'url') ??
    (card.website_url ? { url: ensureHttps(card.website_url), label: card.website_url } : null)

  return (
    <div
      className="min-h-dvh w-full flex flex-col items-center py-12 px-5"
      style={{ background: '#0f0f0f', maxWidth: '480px', margin: '0 auto' }}
    >
      <motion.div
        className="w-full"
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 프로필 */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-24 h-24 rounded-full overflow-hidden mb-4"
            style={{ border: '2px solid #262626' }}
          >
            {card.profile_image_url ? (
              <Image
                src={card.profile_image_url}
                alt={card.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: '#1c1c1c' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#f5f5f5' }}>
            {card.name}
          </h1>
          <p className="text-sm" style={{ color: '#737373' }}>
            {card.position} · {card.company_name}
          </p>
          {card.short_intro && (
            <p className="text-sm mt-3 text-center leading-relaxed" style={{ color: '#525252' }}>
              {card.short_intro}
            </p>
          )}
        </div>

        {/* 링크 목록 */}
        <div className="flex flex-col gap-2">
          {phoneLink && (
            <a
              href={phoneLink.url}
              className="touch-btn flex items-center justify-between px-5 rounded-2xl text-sm transition-all active:scale-95"
              style={{ background: '#1c1c1c', color: '#a3a3a3', height: '54px', border: '1px solid #262626' }}
            >
              <span className="flex items-center gap-3">
                <Phone size={16} style={{ color: '#737373' }} />
                {card.phone}
              </span>
              <ChevronRight size={15} style={{ color: '#404040' }} />
            </a>
          )}
          {emailLink && (
            <a
              href={emailLink.url}
              className="touch-btn flex items-center justify-between px-5 rounded-2xl text-sm transition-all active:scale-95"
              style={{ background: '#1c1c1c', color: '#a3a3a3', height: '54px', border: '1px solid #262626' }}
            >
              <span className="flex items-center gap-3">
                <Mail size={16} style={{ color: '#737373' }} />
                {card.email}
              </span>
              <ChevronRight size={15} style={{ color: '#404040' }} />
            </a>
          )}
          {instaLink && (
            <a
              href={ensureHttps(instaLink.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-btn flex items-center justify-between px-5 rounded-2xl text-sm transition-all active:scale-95"
              style={{ background: '#1c1c1c', color: '#a3a3a3', height: '54px', border: '1px solid #262626' }}
            >
              <span className="flex items-center gap-3">
                <Instagram size={16} style={{ color: '#737373' }} />
                Instagram
              </span>
              <ChevronRight size={15} style={{ color: '#404040' }} />
            </a>
          )}
          {siteLink && (
            <a
              href={ensureHttps(siteLink.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-btn flex items-center justify-between px-5 rounded-2xl text-sm transition-all active:scale-95"
              style={{ background: '#1c1c1c', color: '#a3a3a3', height: '54px', border: '1px solid #262626' }}
            >
              <span className="flex items-center gap-3">
                <Globe size={16} style={{ color: '#737373' }} />
                {card.website_url?.replace(/^https?:\/\//, '')}
              </span>
              <ChevronRight size={15} style={{ color: '#404040' }} />
            </a>
          )}
        </div>
      </motion.div>
    </div>
  )
}
