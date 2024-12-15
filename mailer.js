const AWS = require('aws-sdk');

// Configure AWS SES
AWS.config.update({ region: 'us-east-2' }); // Replace with your SES region

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

exports.handler = async (event) => {
    try {
        const { toEmail, subject, message } = JSON.parse(event.body);

        // Set up email parameters
        const params = {
            Source: 'your-verified-email@example.com', // Replace with your SES verified email
            Destination: {
                ToAddresses: [toEmail],
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8',
                },
                Body: {
                    Text: {
                        Data: message,
                        Charset: 'UTF-8',
                    },
                },
            },
        };

        // Send email
        const result = await ses.sendEmail(params).promise();
        console.log('Email sent successfully:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully.' }),
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send email.' }),
        };
    }
};
