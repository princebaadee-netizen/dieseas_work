import { Link } from 'react-router-dom'
import { Tag } from '@/components/shared/Tag'
import type { Disease } from '@/types'

interface DiseaseHeaderProps {
  disease: Disease
}

/** Header block for the disease page (name, category tag, description). */
export function DiseaseHeader({ disease }: DiseaseHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone="brand">
          <Link to={`/category/${disease.category.slug}`} className="hover:underline">
            {disease.category.name}
          </Link>
        </Tag>
      </div>
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{disease.name}</h1>
      <p className="max-w-3xl text-lg leading-relaxed text-muted">{disease.description}</p>
    </header>
  )
}
