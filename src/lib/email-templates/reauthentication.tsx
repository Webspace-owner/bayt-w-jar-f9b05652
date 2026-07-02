import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>كود التحقق بتاعك</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>تأكيد الهوية</Heading>
        <Text style={text}>استخدم الكود ده عشان تأكد هويتك:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          الكود ده هينتهي بعد فترة قصيرة. لو مش إنت اللي طلبت ده، تجاهل الإيميل.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Tahoma, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.7', margin: '0 0 25px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '22px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 30px', direction: 'ltr' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
