export function meta() {
  return [
    { title: 'the news' },
    { name: 'description', content: 'the news — design engineer case' },
  ]
}

export default function Home() {
  return (
    <div className="px-4 py-6 space-y-4">
      <p className="text-muted-foreground text-sm text-center mt-8">
        {/* Conteúdo da Home / Feed — fora do escopo deste módulo */}
        Conteúdo da edição em desenvolvimento.
      </p>
    </div>
  )
}
