import nodemailer from 'nodemailer'

type BookingEmailPayload = {
  to: string
  guestName: string
  bookingCode: string
  roomName: string
  checkIn: Date | string
  checkOut: Date | string
  total: number       // total in Paise
  paidAmount?: number // paid in Paise
  nights?: number
}

// Format Paise to readable Rupees
const formatRupees = (paise: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export async function sendBookingConfirmation(payload: BookingEmailPayload) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  // Default to console log if SMTP credentials are not yet configured in env
  if (!user || !pass) {
    console.log('[email:stub] SMTP credentials missing in env. Logged details below:')
    console.log({
      to: payload.to,
      guestName: payload.guestName,
      bookingCode: payload.bookingCode,
      roomName: payload.roomName,
      total: formatRupees(payload.total),
      paidAmount: formatRupees(payload.paidAmount ?? payload.total),
      balance: formatRupees(payload.total - (payload.paidAmount ?? payload.total)),
    })
    return { ok: true, stub: true }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const checkInDate = new Date(payload.checkIn).toLocaleDateString('en-IN', { dateStyle: 'long' })
  const checkOutDate = new Date(payload.checkOut).toLocaleDateString('en-IN', { dateStyle: 'long' })
  
  const totalStr = formatRupees(payload.total)
  const paidVal = payload.paidAmount ?? payload.total
  const paidStr = formatRupees(paidVal)
  const balanceVal = Math.max(0, payload.total - paidVal)
  const balanceStr = formatRupees(balanceVal)

  const nightsStr = payload.nights ? `${payload.nights} Night${payload.nights === 1 ? '' : 's'}` : 'Multiple Nights'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Sanctuary is Confirmed</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FDFCFB;
          color: #1A1A1A;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #FFFFFF;
          border: 1px solid #EAE5E0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }
        .header {
          background-color: #1A1A1A;
          padding: 40px;
          text-align: center;
          border-bottom: 2px solid #D4AF37;
        }
        .header h1 {
          font-size: 24px;
          font-weight: 300;
          letter-spacing: 0.3em;
          color: #D4AF37;
          margin: 0;
          text-transform: uppercase;
        }
        .header p {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.5em;
          color: #FFFFFF;
          opacity: 0.5;
          margin: 10px 0 0 0;
          text-transform: uppercase;
        }
        .content {
          padding: 40px;
        }
        .greeting {
          font-size: 20px;
          font-family: Georgia, serif;
          color: #1A1A1A;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .intro-text {
          font-size: 14px;
          color: #666666;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .details-box {
          background-color: #FDFCFB;
          border: 1px solid #F0ECE8;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }
        .details-title {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.2em;
          color: #D4AF37;
          text-transform: uppercase;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #F0ECE8;
        }
        .detail-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .detail-label {
          color: #999999;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.1em;
        }
        .detail-value {
          color: #1A1A1A;
          font-weight: bold;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .invoice-table th {
          text-align: left;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: #999999;
          text-transform: uppercase;
          padding-bottom: 10px;
          border-bottom: 1px solid #EAE5E0;
        }
        .invoice-table td {
          padding: 15px 0;
          border-bottom: 1px solid #F0ECE8;
          font-size: 13px;
        }
        .invoice-total-row td {
          border-bottom: none;
          font-weight: bold;
        }
        .paid-amount {
          color: #10B981;
          font-size: 16px;
          font-weight: bold;
        }
        .balance-amount {
          color: #D4AF37;
          font-size: 16px;
          font-weight: bold;
        }
        .footer {
          background-color: #FDFCFB;
          border-top: 1px solid #EAE5E0;
          padding: 30px;
          text-align: center;
          font-size: 11px;
          color: #999999;
          line-height: 1.6;
        }
        .footer a {
          color: #1A1A1A;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Wundervoll</h1>
          <p>Beachfront Sanctuary</p>
        </div>

        <div class="content">
          <h2 class="greeting">Dear ${payload.guestName},</h2>
          <p class="intro-text">
            We are absolutely delighted to confirm your upcoming escape to Wundervoll Resort. Your private booking has been successfully recorded in our reservation books.
          </p>

          <div class="details-box">
            <h3 class="details-title">Your Itinerary Details</h3>
            <div class="detail-row">
              <span class="detail-label">Sanctuary Room</span>
              <span class="detail-value">${payload.roomName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Reference Code</span>
              <span class="detail-value" style="font-family: monospace; font-size: 14px;">${payload.bookingCode}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-In</span>
              <span class="detail-value">${checkInDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-Out</span>
              <span class="detail-value">${checkOutDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration</span>
              <span class="detail-value">${nightsStr}</span>
            </div>
          </div>

          <h3 class="details-title" style="margin-bottom: 12px;">Financial Statement & Receipt</h3>
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Accommodation Investment (${payload.roomName})</td>
                <td style="text-align: right; font-weight: bold;">${totalStr}</td>
              </tr>
              <tr class="invoice-total-row">
                <td style="color: #10B981; font-weight: bold; padding-top: 20px;">Amount Paid (Secured)</td>
                <td style="text-align: right; padding-top: 20px;" class="paid-amount">${paidStr}</td>
              </tr>
              ${balanceVal > 0 ? `
              <tr class="invoice-total-row">
                <td style="color: #D4AF37; font-weight: bold;">Remaining Balance (Due on Arrival)</td>
                <td style="text-align: right;" class="balance-amount">${balanceStr}</td>
              </tr>
              ` : `
              <tr class="invoice-total-row">
                <td style="color: #10B981; font-weight: bold;">Outstanding Balance</td>
                <td style="text-align: right; color: #10B981; font-weight: bold;">Fully Paid</td>
              </tr>
              `}
            </tbody>
          </table>

          <p class="intro-text" style="margin-top: 30px;">
            If you need any special requests, custom menus, or assistance with local transfers, please reply directly to this email or reach our concierge team instantly via WhatsApp.
          </p>
        </div>

        <div class="footer">
          <p>
            <strong>Wundervoll Resort</strong><br>
            Coast Road, Konkan Coast, India<br>
            <a href="mailto:stay@wundervoll.com">stay@wundervoll.com</a> · <a href="https://wa.me/919539079358">WhatsApp Concierge</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Wundervoll Resort" <${user}>`,
    to: payload.to,
    subject: `Your Sanctuary is Secured · Wundervoll Resort [${payload.bookingCode}]`,
    html: htmlContent,
  })

  return { ok: true, stub: false }
}
