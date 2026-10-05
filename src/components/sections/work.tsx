import { projects } from '@/content/projects'
import { SectionHead } from '@/components/motion/section-head'
import { ProjectRows } from './project-rows'

/** Портфолио — спокойный список: подтверждает опыт, не перетягивает внимание с услуг и тарифов. */
export function Work() {
  return (
    <section id="work" className="container-x border-t border-line py-[14vh]">
      <SectionHead index="07" label="Проекты" title="Примеры работ" />
      <ProjectRows projects={projects} />
    </section>
  )
}
