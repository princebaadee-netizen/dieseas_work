import { Link } from 'react-router-dom'
import { BookOpen, Info, ShieldCheck, Stethoscope } from 'lucide-react'
import { usePageTitle } from '@/utilities/usePageTitle'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { DISCLAIMER_TEXT } from '@/components/shared/disclaimerText'
import { buttonClasses } from '@/components/shared/buttonClasses'

/**
 * The about and disclaimer page (Project Plan section 2.1).
 * Uses the shared disclaimer wording so it reads the same everywhere.
 */
export function About() {
  usePageTitle('About and disclaimer')

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About and disclaimer' }]} />

      <header>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          About and disclaimer
        </h1>
        <p className="mt-2 text-muted">
          DiseaseWise is an educational disease and remedy information system.
        </p>
      </header>

      <div className="prose-read space-y-6">
        <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-light p-2 text-primary-dark">
              <Info aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Purpose</h2>
              <p className="mt-3 leading-relaxed text-muted">
                DiseaseWise is a place to search for a disease and read about its symptoms, causes,
                risk factors, prevention and medically recognized treatment information, all in one
                place. An administrator keeps the content reviewed and up to date.
              </p>
              <p className="mt-3 leading-relaxed text-muted">
                The site is built for readers who want plain-language health information, and for
                students, teachers and health workers who need a clear starting point.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-light p-2 text-primary-dark">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Limits</h2>
              <p className="mt-3 leading-relaxed text-muted">{DISCLAIMER_TEXT}</p>
              <p className="mt-3 leading-relaxed text-muted">
                The information here cannot take the place of a consultation. It cannot tell you
                what is wrong with you, and it cannot tell you which medicine to take. If you are
                worried about a symptom, contact a doctor or another qualified health professional.
              </p>
              <p className="mt-3 leading-relaxed text-muted">
                No dosages and no specific prescription instructions appear anywhere on this site.
                Treatment information names the kinds of treatment that are used and points you to a
                health professional.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-light p-2 text-primary-dark">
              <BookOpen aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Sourcing</h2>
              <p className="mt-3 leading-relaxed text-muted">
                Content is based on reliable references such as the World Health Organization, NCDC,
                the CDC, the NHS and Mayo Clinic. It is rewritten in plain language rather than
                copied, and every remedy page shows its source and the date it was last reviewed.
              </p>
              <p className="mt-3 leading-relaxed text-muted">
                Content is written in consistent plain language, and a qualified person such as a
                pharmacist, nurse, doctor or lecturer should read it before it is relied on.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-light p-2 text-primary-dark">
              <Stethoscope aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Consult a professional</h2>
              <p className="mt-3 leading-relaxed text-muted">
                If you have symptoms that are severe, that are getting worse, or that you do not
                understand, seek medical care. The red box on each remedy page lists the signs that
                need urgent attention. When in doubt, ask a health professional.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/search?q=malaria" className={buttonClasses('primary', 'md')}>
                  Search a disease
                </Link>
                <Link to="/categories" className={buttonClasses('outline', 'md')}>
                  Browse categories
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
