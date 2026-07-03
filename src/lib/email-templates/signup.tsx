import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>أكّد بريدك الإلكتروني على {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>أكّد بريدك الإلكتروني</Heading>
        <Text style={text}>
          شكراً لتسجيلك في{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          من فضلك أكّد بريدك الإلكتروني (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) بالضغط على الزر ده:
        </Text>
        <Button style={button} href={confirmationUrl}>
          تأكيد البريد
        </Button>
        <Text style={fallback}>
          لو الزر مش شغال، افتح الرابط ده في المتصفح:
          <br />
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Text style={footer}>
          لو مش إنت اللي عملت الحساب، تجاهل الإيميل ده.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Tahoma, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.7', margin: '0 0 25px' }
const link = { color: 'inherit', textDecoration: 'underline', wordBreak: 'break-all' as const }
const button = { backgroundColor: '#000000', color: '#ffffff', fontSize: '14px', borderRadius: '8px', padding: '12px 20px', textDecoration: 'none' }
const fallback = { fontSize: '12px', color: '#777777', lineHeight: '1.7', margin: '20px 0 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
