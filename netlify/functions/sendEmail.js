const nodemailer = require('nodemailer')
const { templates } = require('../../src/utils/messageTemplates')

// Production SMTP config (replace with your real SMTP server details)
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g. 'smtp.yourprovider.com'
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your SMTP username
    pass: process.env.SMTP_PASS  // your SMTP password
  }
})

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  }

  try {
    const body = JSON.parse(event.body)
    const { to, subject, message, language = 'en', template = 'statusUpdate', status } = body

    let text
    if (template === 'newMessage') {
      text = templates[language]?.newMessage || templates['en'].newMessage
    } else {
      text = templates[language]?.statusUpdate(status) || templates['en'].statusUpdate(status)
    }

    // Optionally append custom message
    if (message && template !== 'newMessage') {
      text += `\n${message}`
    }

    let info = await transporter.sendMail({
      from: 'Smart Exporters <no-reply@smartexporters.com>',
      to,
      subject: subject || 'Shipment Update',
      text
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, messageId: info.messageId }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  }
} 