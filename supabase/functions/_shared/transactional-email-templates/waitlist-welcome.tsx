import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'TradePeaks'
const LOGO_URL = 'https://wwixjhsbwasnoldyrtdk.supabase.co/storage/v1/object/public/email-assets/waitlist-hero.png'

interface WaitlistWelcomeProps {
  firstName?: string
}

const WaitlistWelcomeEmail = ({ firstName }: WaitlistWelcomeProps) => {
  const greetingName = firstName?.trim()
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You're on the {SITE_NAME} waitlist — here's what to expect.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Hero */}
          <Section style={hero}>
            <Img src={LOGO_URL} alt={SITE_NAME} width="120" height="120" style={logo} />
            <Text style={eyebrow}>WAITLIST CONFIRMED</Text>
            <Heading style={h1}>
              {greetingName ? `Welcome to the climb, ${greetingName}.` : 'Welcome to the climb.'}
            </Heading>
          </Section>

          {/* Body */}
          <Section style={bodySection}>
            <Text style={paragraph}>
              You're officially on the {SITE_NAME} waitlist. We're building the trading
              journal we always wanted — one that treats every session like a deliberate
              climb toward a defined summit.
            </Text>
            <Text style={paragraph}>Here's what to expect from us:</Text>

            <Section style={{ ...featureRow, borderLeftColor: '#06b6d4' }}>
              <Text style={featureTitle}>Early access invite</Text>
              <Text style={featureBody}>
                You'll be among the first to step inside when we open the doors.
              </Text>
            </Section>

            <Section style={{ ...featureRow, borderLeftColor: '#3b82f6' }}>
              <Text style={featureTitle}>Behind-the-scenes drops</Text>
              <Text style={featureBody}>
                Occasional previews of features, philosophy, and the climb itself.
              </Text>
            </Section>

            <Section style={{ ...featureRow, borderLeftColor: '#8b5cf6' }}>
              <Text style={featureTitle}>Zero noise</Text>
              <Text style={featureBody}>
                No spam, no upsells. Just the launch signal when the summit opens.
              </Text>
            </Section>

            <Text style={paragraph}>Until then — keep journaling, keep climbing.</Text>
            <Text style={signoff}>— The {SITE_NAME} team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WaitlistWelcomeEmail,
  subject: `You're on the ${SITE_NAME} waitlist`,
  displayName: 'Waitlist welcome',
  previewData: { firstName: 'Alex' },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
}

const hero: React.CSSProperties = {
  background:
    'linear-gradient(135deg, #030712 0%, #0b1220 55%, #0e2a4a 100%)',
  padding: '44px 32px',
  textAlign: 'center',
  borderTopLeftRadius: '14px',
  borderTopRightRadius: '14px',
}

const logo: React.CSSProperties = {
  display: 'inline-block',
  marginBottom: '18px',
}

const eyebrow: React.CSSProperties = {
  color: '#67e8f9',
  fontSize: '11px',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  margin: '0 0 10px',
}

const h1: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 700,
  margin: 0,
  letterSpacing: '-0.5px',
  lineHeight: 1.2,
}

const bodySection: React.CSSProperties = {
  padding: '36px 36px 24px',
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: 1.7,
  color: '#1e293b',
  margin: '0 0 18px',
}

const featureRow: React.CSSProperties = {
  padding: '14px 16px',
  backgroundColor: '#f8fafc',
  borderLeft: '3px solid #06b6d4',
  borderRadius: '6px',
  margin: '0 0 10px',
}

const featureTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 4px',
}

const featureBody: React.CSSProperties = {
  fontSize: '13px',
  color: '#475569',
  lineHeight: 1.5,
  margin: 0,
}

const signoff: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: 1.7,
  color: '#1e293b',
  margin: '8px 0 0',
}
