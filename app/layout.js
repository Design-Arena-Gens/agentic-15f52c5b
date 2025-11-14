export const metadata = {
  title: 'Forest at Dusk',
  description: 'A hyper-realistic forest scene at dusk with fireflies',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
