import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  IoNotifications,
  IoFlame,
  IoChatbubbles,
  IoGameController,
  IoFootball,
  IoPricetag,
  IoPeople,
  IoSearch,
  IoGift,
  IoNewspaper,
  IoArchive,
  IoCalendar,
  IoHeadset,
  IoPerson,
  IoBan,
  IoSchool,
  IoHelpCircle,
  IoMail,
  IoGlobe,
  IoLogoInstagram,
  IoChevronForward,
} from 'react-icons/io5'
import { useUser } from '~/context/user-context'

export function meta() {
  return [{ title: 'More — the news' }]
}

/* ─── Types ─────────────────────────────────────────────────────── */

type MoreItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconBg: string
  labelKey: string
  descriptionKey: string
  badgeKey?: string
  badgeVariant?: 'new' | 'promo'
  to?: string
}

type MoreSection = {
  titleKey: string
  items: MoreItem[]
}

/* ─── Data ───────────────────────────────────────────────────────── */

const MORE_SECTIONS: MoreSection[] = [
  {
    titleKey: 'common.more.sections.resources',
    items: [
      { icon: IoNotifications,  iconBg: '#92400E', labelKey: 'common.more.items.notifications.label', descriptionKey: 'common.more.items.notifications.description' },
      { icon: IoFlame,          iconBg: '#B91C1C', labelKey: 'common.more.items.streak.label',        descriptionKey: 'common.more.items.streak.description' },
      { icon: IoChatbubbles,    iconBg: '#374151', labelKey: 'common.more.items.discussions.label',   descriptionKey: 'common.more.items.discussions.description' },
      { icon: IoGameController, iconBg: '#6D28D9', labelKey: 'common.more.items.games.label',        descriptionKey: 'common.more.items.games.description',        badgeKey: 'common.more.badge.new', badgeVariant: 'new' },
      { icon: IoFootball,       iconBg: '#166534', labelKey: 'common.more.items.cupitas.label',      descriptionKey: 'common.more.items.cupitas.description' },
      { icon: IoPricetag,       iconBg: '#9F1239', labelKey: 'common.more.items.event.label',        descriptionKey: 'common.more.items.event.description' },
      { icon: IoPeople,         iconBg: '#1D4ED8', labelKey: 'common.more.items.community.label',    descriptionKey: 'common.more.items.community.description' },
      { icon: IoSearch,         iconBg: '#0E7490', labelKey: 'common.more.items.search.label',       descriptionKey: 'common.more.items.search.description' },
      { icon: IoPricetag,       iconBg: '#0F766E', labelKey: 'common.more.items.coupons.label',      descriptionKey: 'common.more.items.coupons.description' },
      { icon: IoGift,           iconBg: '#7C3AED', labelKey: 'common.more.items.gift.label',         descriptionKey: 'common.more.items.gift.description',         badgeKey: 'common.more.badge.earnPrizes', badgeVariant: 'promo' },
      { icon: IoNewspaper,      iconBg: '#78350F', labelKey: 'common.more.items.newsFeed.label',     descriptionKey: 'common.more.items.newsFeed.description' },
      { icon: IoArchive,        iconBg: '#1F2937', labelKey: 'common.more.items.pastEditions.label', descriptionKey: 'common.more.items.pastEditions.description' },
      { icon: IoCalendar,       iconBg: '#B91C1C', labelKey: 'common.more.items.agenda.label',       descriptionKey: 'common.more.items.agenda.description',       badgeKey: 'common.more.badge.new', badgeVariant: 'new' },
      { icon: IoHeadset,        iconBg: '#6D28D9', labelKey: 'common.more.items.podcasts.label',     descriptionKey: 'common.more.items.podcasts.description',     badgeKey: 'common.more.badge.new', badgeVariant: 'new' },
    ],
  },
  {
    titleKey: 'common.more.sections.account',
    items: [
      { icon: IoPerson,         iconBg: '#1D4ED8', labelKey: 'common.more.items.profile.label',     descriptionKey: 'common.more.items.profile.description', to: '/settings' },
      { icon: IoBan,            iconBg: '#B91C1C', labelKey: 'common.more.items.blocked.label',     descriptionKey: 'common.more.items.blocked.description' },
      { icon: IoSchool,         iconBg: '#065F46', labelKey: 'common.more.items.onboarding.label',  descriptionKey: 'common.more.items.onboarding.description' },
    ],
  },
  {
    titleKey: 'common.more.sections.contact',
    items: [
      { icon: IoHelpCircle,     iconBg: '#B45309', labelKey: 'common.more.items.help.label',         descriptionKey: 'common.more.items.help.description' },
      { icon: IoMail,           iconBg: '#1D4ED8', labelKey: 'common.more.items.emailContact.label', descriptionKey: 'common.more.items.emailContact.description' },
      { icon: IoGlobe,          iconBg: '#4338CA', labelKey: 'common.more.items.site.label',         descriptionKey: 'common.more.items.site.description' },
      { icon: IoLogoInstagram,  iconBg: '#BE185D', labelKey: 'common.more.items.instagram.label',    descriptionKey: 'common.more.items.instagram.description' },
    ],
  },
]

/* ─── Item row ───────────────────────────────────────────────────── */

function MoreItemRow({ icon: Icon, iconBg, labelKey, descriptionKey, badgeKey, to }: MoreItem) {
  const { t } = useTranslation()
  const label = t(labelKey)
  const description = t(descriptionKey)
  const badge = badgeKey ? t(badgeKey) : undefined

  const rowClass = "flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:bg-white/5"

  const content = (
    <>
      <span
        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{ backgroundColor: iconBg }}
        aria-hidden="true"
      >
        <Icon size={20} className="text-white" />
      </span>

      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-medium text-chrome-text leading-snug">
          {label}
        </span>
        <span className="block text-[12px] text-chrome-muted leading-snug">
          {description}
        </span>
      </span>

      {badge && (
        <span
          aria-label={badge}
          className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold leading-none bg-brand text-chrome-bg"
        >
          {badge}
        </span>
      )}

      <IoChevronForward size={16} className="shrink-0 text-chrome-muted" aria-hidden="true" />
    </>
  )

  return (
    <li>
      {to ? (
        <Link to={to} aria-label={`${label} — ${description}`} className={rowClass}>
          {content}
        </Link>
      ) : (
        <button type="button" aria-label={`${label} — ${description}`} className={rowClass}>
          {content}
        </button>
      )}
    </li>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function More() {
  const { t } = useTranslation()
  const user = useUser()

  return (
    <div className="min-h-full bg-chrome-bg">
      {/* Page header */}
      <header className="sticky top-0 z-10 bg-chrome-bg border-b border-brand/25 px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-chrome-text font-bold text-2xl leading-tight">
              {t('common.more.title')}
            </h1>
            <p className="text-chrome-muted text-[13px] leading-snug mt-0.5">
              {t('common.more.subtitle')}
            </p>
          </div>

          <Link
            to="/settings"
            aria-label={t('common.more.items.profile.label')}
            className="w-10 h-10 rounded-full shrink-0 overflow-hidden border-2 border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </header>

      {/* Sections */}
      <div className="pb-6">
        {MORE_SECTIONS.map((section) => (
          <section key={section.titleKey} className="mt-5">
            <h2 className="px-4 mb-1 text-chrome-text font-bold text-[15px] leading-snug">
              {t(section.titleKey)}
            </h2>

            <div className="bg-chrome-surface">
              <ul
                className="list-none m-0 p-0 divide-y divide-chrome-divider"
                role="list"
                aria-label={t(section.titleKey)}
              >
                {section.items.map((item) => (
                  <MoreItemRow key={item.labelKey} {...item} />
                ))}
              </ul>
            </div>
          </section>
        ))}

        <p className="text-center text-chrome-muted text-[11px] mt-8 pb-4">
          the news App v1.5.2
        </p>
      </div>
    </div>
  )
}
