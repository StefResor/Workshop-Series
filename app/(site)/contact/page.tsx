import type { Metadata } from 'next'
import { ContactForm } from '@/components/ContactForm'
import { buildPageMetadata } from '@/lib/seo'

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: 'Contact',
    description:
      'Request a confidential consultation with Stefanie Schumacher. Private-pay Relational Diplomacy for individuals and couples.',
    path: '/contact',
  })
}

export default function ContactPage() {
  return (
    <>
      <header className="page-hero">
        <span className="kicker">Consultation</span>
        <h1>Request a confidential consultation</h1>
        <p className="lede">
          Structured, direct relationship work for high-responsibility professionals
          and leaders. Deliberately small caseload. Private-pay, online, and discreet.
        </p>
      </header>
      <section className="section" aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading" className="visually-hidden">
          Consultation request form
        </h2>
        <ContactForm />
      </section>
    </>
  )
}
