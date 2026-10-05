import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(80),
  contact: z.string().trim().min(3, 'Укажите Telegram, телефон или email').max(120),
  project: z.enum(['landing', 'studio', 'flagship', 'other']).default('other'),
  message: z.string().trim().max(2000).optional().default(''),
  consent: z.literal(true, { message: 'Нужно согласие на обработку данных' }),
  website: z.string().max(0).optional().default(''), // honeypot
})
export type LeadInput = z.input<typeof leadSchema>
