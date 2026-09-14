import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SkinProvider } from '../context/SkinContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SkinSync - วิเคราะห์ผิวและแนะนำสกินแคร์ด้วย AI',
  description: 'ระบบวิเคราะห์และคัดกรองสารสกินแคร์เฉพาะบุคคล ด้วย AI ร่วมกับหลักสรีรวิทยาผิวหนัง',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} h-full`}>
      <head>
        {/* ป้องกันข้อผิดพลาด TypeError ใน react-webcam บนมือถือหรือเครือข่าย HTTP */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined' && window.navigator && window.navigator.mediaDevices === undefined) {
                  Object.defineProperty(window.navigator, 'mediaDevices', {
                    value: {},
                    writable: true,
                    configurable: true
                  });
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gradient-to-b from-gray-50 via-gray-100/60 to-gray-50 text-gray-900 min-h-screen">
        <SkinProvider>
          <main className="max-w-md mx-auto min-h-screen relative flex flex-col justify-between">
            {children}
          </main>
        </SkinProvider>
      </body>
    </html>
  );
}
