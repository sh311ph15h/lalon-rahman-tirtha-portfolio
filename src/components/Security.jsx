import { FaCheckCircle, FaHourglassHalf } from 'react-icons/fa'
import { Section } from './Section'
import { LabCaseFiles } from './LabCaseFiles'
import { AdLabMap } from './AdLabMap'
import { ReviewCard } from './ReviewCard'
import { certifications, securityWork } from '../data'

// The lab cards are now shown as case files; keep the infrastructure builds as compact cards.
const builds = securityWork.filter((w) => /pfSense|VoIP/.test(w.title))

export function Security() {
  return (
    <Section id="security" eyebrow="security" title="Security work">
      <p className="-mt-6 mb-8 max-w-2xl text-muted">
        Pick a case file, or let it play: what I found, how the attack unfolded mapped to MITRE ATT&amp;CK, and how to fix it.
      </p>

      <LabCaseFiles />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <AdLabMap />
        <ReviewCard />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {builds.map(({ title, icon: Icon, summary, tags }) => (
          <article key={title} className="flex flex-col rounded-xl border border-border bg-surface p-5 transition hover:border-accent/50">
            <div className="flex items-center gap-3">
              <Icon className="text-xl text-accent" aria-hidden />
              <h3 className="font-bold">{title}</h3>
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{summary}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <li key={t} className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted">{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h3 className="mb-4 mt-14 font-mono text-sm uppercase tracking-wider text-muted">Certifications &amp; training</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {certifications.map(({ name, issuer, status }) => (
          <li key={name} className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3">
            {status === 'done'
              ? <FaCheckCircle className="mt-1 shrink-0 text-emerald-400" aria-label="Completed" />
              : <FaHourglassHalf className="mt-1 shrink-0 text-amber-400" aria-label="In progress" />}
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted">{issuer}{status === 'progress' && ' · in progress'}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
