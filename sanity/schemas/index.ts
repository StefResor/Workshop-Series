import { workshop } from './workshop'
import { workshopTopic } from './workshop-topic'
import { workshopSession } from './workshop-session'
import { service } from './service'
import { page } from './page'
import { siteSettings } from './siteSettings'
import { emailSignup } from './emailSignup'
import { policy } from './policy'
import { series, registration } from './workshop-system'

export const schemaTypes = [
  series,
  workshopTopic,
  workshopSession,
  workshop,
  service,
  page,
  siteSettings,
  emailSignup,
  policy,
  registration,
]
