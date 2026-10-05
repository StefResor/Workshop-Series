import { redirect } from 'next/navigation'

/** Legacy package URL — series pass is retired. */
export default function LegacySeriesPackageRedirect() {
  redirect('/workshops')
}
