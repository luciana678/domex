import { FilesProvider } from '@/context/FilesContext'
import { MapReduceProvider } from '@/context/MapReduceContext'
import { RoomProvider } from '@/context/RoomContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DOMEX',
  description: 'DOMEX: Distributed Online Mapreduce EXperience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} h-screen m-0`}>
        <RoomProvider>
          <MapReduceProvider>
            <FilesProvider>
              {children}
              <Toaster richColors />
            </FilesProvider>
          </MapReduceProvider>
        </RoomProvider>
      </body>
    </html>
  )
}
