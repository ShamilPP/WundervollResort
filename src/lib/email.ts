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
  const apiKey = process.env.BREVO_API_KEY
  const fromEmail = process.env.SMTP_FROM || 'wunderwolliceland@gmail.com'

  // Default to console log if SMTP credentials are not yet configured in env
  if (!apiKey) {
    console.log('[email:stub] BREVO_API_KEY missing in env. Logged details below:')
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

  console.log(`[email:send] Initiating Brevo API dispatch to "${payload.to}" for booking "${payload.bookingCode}"...`)

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
          <h2 class="greeting">Hi ${payload.guestName},</h2>
          <p class="intro-text">
            Thank you so much for choosing Wundervoll Resort. Your reservation is fully confirmed! We are already preparing everything to make sure your stay is beautiful, peaceful, and absolutely relaxing.
          </p>

          <div class="details-box">
            <h3 class="details-title">Your Stay Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
              <tr>
                <td style="text-align: left; padding: 12px 0; border-bottom: 1px dashed #F0ECE8; font-size: 10px; font-weight: bold; color: #999999; text-transform: uppercase; letter-spacing: 0.1em;">Room / Villa</td>
                <td style="text-align: right; padding: 12px 0; border-bottom: 1px dashed #F0ECE8; font-size: 13px; font-weight: bold; color: #1A1A1A;">${payload.roomName}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 12px 0; border-bottom: 1px dashed #F0ECE8; font-size: 10px; font-weight: bold; color: #999999; text-transform: uppercase; letter-spacing: 0.1em;">Booking Reference</td>
                <td style="text-align: right; padding: 12px 0; border-bottom: 1px dashed #F0ECE8; font-size: 13px; font-weight: bold; color: #1A1A1A; font-family: monospace;">${payload.bookingCode}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 12px 0; border-bottom: 1px dashed #F0ECE8; font-size: 10px; font-weight: bold; color: #999999; text-transform: uppercase; letter-spacing: 0.1em;">Arrival Date</td>
                <td style="text-align: right; padding: 12px 0; border-bottom: 1px dashed #F0ECE8; font-size: 13px; font-weight: bold; color: #1A1A1A;">${checkInDate}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 12px 0; border-bottom: 1px dashed #F0ECE8; font-size: 10px; font-weight: bold; color: #999999; text-transform: uppercase; letter-spacing: 0.1em;">Departure Date</td>
                <td style="text-align: right; padding: 12px 0; border-bottom: 1px dashed #F0ECE8; font-size: 13px; font-weight: bold; color: #1A1A1A;">${checkOutDate}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 12px 0; font-size: 10px; font-weight: bold; color: #999999; text-transform: uppercase; letter-spacing: 0.1em;">Total Nights</td>
                <td style="text-align: right; padding: 12px 0; font-size: 13px; font-weight: bold; color: #1A1A1A;">${nightsStr}</td>
              </tr>
            </table>
          </div>

          <h3 class="details-title" style="margin-bottom: 12px;">Payment Summary</h3>
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Room Charges (${payload.roomName})</td>
                <td style="text-align: right; font-weight: bold;">${totalStr}</td>
              </tr>
              <tr class="invoice-total-row">
                <td style="color: #10B981; font-weight: bold; padding-top: 20px;">Amount Paid</td>
                <td style="text-align: right; padding-top: 20px;" class="paid-amount">${paidStr}</td>
              </tr>
              ${balanceVal > 0 ? `
              <tr class="invoice-total-row">
                <td style="color: #D4AF37; font-weight: bold;">Balance Due on Arrival</td>
                <td style="text-align: right;" class="balance-amount">${balanceStr}</td>
              </tr>
              ` : `
              <tr class="invoice-total-row">
                <td style="color: #10B981; font-weight: bold;">Remaining Balance</td>
                <td style="text-align: right; color: #10B981; font-weight: bold;">Fully Paid</td>
              </tr>
              `}
            </tbody>
          </table>

          <p class="intro-text" style="margin-top: 30px; margin-bottom: 10px;">
            If you need anything at all—whether it is help with airport transfers, special room requests, or a custom dining menu—please let us know. You can reply directly to this email or chat with us instantly on WhatsApp using the button below.
          </p>

          <div style="text-align: center; margin: 25px 0 35px 0;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://wa.me/919539079358" style="height:50px;v-text-anchor:middle;width:260px;" arcsize="20%" stroke="f" fillcolor="#D4AF37">
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">Chat with us on WhatsApp</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="https://wa.me/919539079358" target="_blank" style="background-color: #D4AF37; border-radius: 12px; color: #FFFFFF; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 260px; -webkit-text-size-adjust: none; box-shadow: 0 4px 12px rgba(212,175,55,0.2);">Chat with us on WhatsApp</a>
            <!--<![endif]-->
          </div>
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

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Wundervoll Resort', email: fromEmail },
        to: [{ email: payload.to, name: payload.guestName }],
        subject: `Your stay at Wundervoll Resort is confirmed! 🌊 [${payload.bookingCode}]`,
        htmlContent: htmlContent,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => null)
      throw new Error(errData?.message || `Brevo API returned status ${res.status}`)
    }

    const data = await res.json().catch(() => null)
    console.log(`[email:success] Mail dispatched successfully to "${payload.to}" via Brevo! Message ID: ${data?.messageId}`)
    return { ok: true, stub: false }
  } catch (err) {
    console.error(`[email:error] Failed to send email to "${payload.to}" via Brevo! Details below:`)
    console.error(err)
    throw err
  }
}
