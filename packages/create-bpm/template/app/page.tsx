import { bpm } from '@blueprint-modular/core'

export default function Home() {
  return (
    <bpm.page>
      <bpm.title>Mon App Blueprint Modular</bpm.title>
      <bpm.metric label="Valeur exemple" value={142500} delta={3200} />
      <bpm.table data={[
        { nom: 'Alice', score: 95 },
        { nom: 'Bob', score: 87 },
      ]} />
      <bpm.chat model="llama3.2" />
    </bpm.page>
  )
}
