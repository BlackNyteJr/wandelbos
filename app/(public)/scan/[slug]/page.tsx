import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ScanRedirect({ params }: Props) {
  const { slug } = await params
  redirect(`/locaties/${slug}`)
}
