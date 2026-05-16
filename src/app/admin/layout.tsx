import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/admin')
  if (session.user.role !== 'ADMIN') redirect('/')

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFCFB]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  )
}
