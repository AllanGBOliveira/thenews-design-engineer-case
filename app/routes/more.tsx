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
import { cn } from '~/lib/utils'

export function meta() {
  return [{ title: 'More — the news' }]
}

/* ─── Types ─────────────────────────────────────────────────────── */

type MoreItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconBg: string
  label: string
  description: string
  badge?: string
  badgeVariant?: 'new' | 'promo'
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
      {
        icon: IoNotifications,
        iconBg: '#92400E',
        label: 'Notificações',
        description: 'central de notificações',
      },
      {
        icon: IoFlame,
        iconBg: '#B91C1C',
        label: 'Meu Streak',
        description: 'leitura da edição',
      },
      {
        icon: IoChatbubbles,
        iconBg: '#374151',
        label: 'Discussões',
        description: 'fórum e debates do dia',
      },
      {
        icon: IoGameController,
        iconBg: '#6D28D9',
        label: 'Jogos',
        description: 'Palavritas, Teia e mais',
        badge: 'NOVO',
        badgeVariant: 'new',
      },
      {
        icon: IoFootball,
        iconBg: '#166534',
        label: 'Copitas',
        description: 'palpita classificados e vencedores',
      },
      {
        icon: IoPricetag,
        iconBg: '#9F1239',
        label: 'Evento seis&seis',
        description: 'saiba mais sobre o evento',
      },
      {
        icon: IoPeople,
        iconBg: '#1D4ED8',
        label: 'Comunidade',
        description: 'feed social de livros',
      },
      {
        icon: IoSearch,
        iconBg: '#0E7490',
        label: 'Buscar pessoas',
        description: 'encontre leitores por nome ou @',
      },
      {
        icon: IoPricetag,
        iconBg: '#0F766E',
        label: 'Cupons',
        description: 'descontos exclusivos para você',
      },
      {
        icon: IoGift,
        iconBg: '#7C3AED',
        label: 'Presente',
        description: 'ganhe recompensas indicando',
        badge: 'GANHE PRÊMIOS',
        badgeVariant: 'promo',
      },
      {
        icon: IoNewspaper,
        iconBg: '#78350F',
        label: 'Notícias',
        description: 'feed personalizado de notícias',
      },
      {
        icon: IoArchive,
        iconBg: '#1F2937',
        label: 'Edições Anteriores',
        description: 'histórico de newsletters',
      },
      {
        icon: IoCalendar,
        iconBg: '#B91C1C',
        label: 'Agenda',
        description: 'calendário de newsletters',
        badge: 'NOVO',
        badgeVariant: 'new',
      },
      {
        icon: IoHeadset,
        iconBg: '#6D28D9',
        label: 'Podcasts',
        description: 'biblioteca de episódios',
        badge: 'NOVO',
        badgeVariant: 'new',
      },
    ],
  },
  {
    titleKey: 'common.more.sections.account',
    items: [
      {
        icon: IoPerson,
        iconBg: '#1D4ED8',
        label: 'Meu Perfil',
        description: 'configurações da conta',
      },
      {
        icon: IoBan,
        iconBg: '#B91C1C',
        label: 'Usuários bloqueados',
        description: 'gerenciar quem você bloqueou',
      },
      {
        icon: IoSchool,
        iconBg: '#065F46',
        label: 'Rever Onboarding',
        description: 'replay do onboarding interativo',
      },
    ],
  },
  {
    titleKey: 'common.more.sections.contact',
    items: [
      {
        icon: IoHelpCircle,
        iconBg: '#B45309',
        label: 'Ajuda',
        description: 'central de suporte',
      },
      {
        icon: IoMail,
        iconBg: '#1D4ED8',
        label: 'E-mail',
        description: 'app@thenews.com.br',
      },
      {
        icon: IoGlobe,
        iconBg: '#4338CA',
        label: 'Site The News',
        description: 'thenews.com.br',
      },
      {
        icon: IoLogoInstagram,
        iconBg: '#BE185D',
        label: 'Instagram',
        description: '@thenews.cc',
      },
    ],
  },
]

/* ─── Item row ───────────────────────────────────────────────────── */

function MoreItemRow({ icon: Icon, iconBg, label, description, badge, badgeVariant }: MoreItem) {
  return (
    <li>
      <button
        type="button"
        aria-label={`${label} — ${description}`}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:bg-white/5"
      >
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
            className={cn(
              'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold leading-none',
              badgeVariant === 'promo'
                ? 'bg-brand text-chrome-bg'
                : 'bg-brand text-chrome-bg',
            )}
          >
            {badge}
          </span>
        )}

        <IoChevronForward size={16} className="shrink-0 text-chrome-muted" aria-hidden="true" />
      </button>
    </li>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function More() {
  const { t } = useTranslation()

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

          <div
            className="w-10 h-10 rounded-full bg-chrome-surface border border-chrome-divider shrink-0 overflow-hidden"
            aria-hidden="true"
          >
            <span className="flex items-center justify-center w-full h-full">
              <IoPerson size={20} className="text-chrome-muted" />
            </span>
          </div>
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
                  <MoreItemRow key={item.label} {...item} />
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
