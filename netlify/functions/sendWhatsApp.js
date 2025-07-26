const twilio = require('twilio')
const { templates } = require('../../src/utils/messageTemplates')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER
const client = twilio(accountSid, authToken)

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
    const { to, message, language = 'en', template = 'statusUpdate', status } = body

    let text
    if (template === 'newMessage') {
      text = templates[language]?.newMessage || templates['en'].newMessage
    } else {
      // statusUpdate
      text = templates[language]?.statusUpdate(status) || templates['en'].statusUpdate(status)
    }

    // Optionally append custom message
    if (message && template !== 'newMessage') {
      text += `\n${message}`
    }

    await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      body: text
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
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