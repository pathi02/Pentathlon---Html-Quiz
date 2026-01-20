export const metadata = {
  title: 'HTML Fill-in-the-Blanks Quiz',
  description: 'Test your HTML knowledge with this fill-in-the-blanks quiz',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


