export const metadata = {
  title: 'Click To Earn',
  description: 'Url Shortener System Architecture',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#070b12' }}>
        {children}
      </body>
    </html>
  );
}
