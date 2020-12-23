const AWS = require("aws-sdk");

type AppSyncEvent = {
  arguments: {
    recipientEmail: string;
  };
};

exports.handler = async (event: AppSyncEvent) => {
  // The "From" address. This address has to be verified in Amazon Pinpoint
  // in the region that you use to send email.
  const senderAddress = "SENDER_ADDRESS";

  // The address on the "To" line. If your Amazon Pinpoint account is in
  // the sandbox, this address also has to be verified.
  var toAddress = event.arguments.recipientEmail;

  // The Amazon Pinpoint project/application ID to use when you send this message.
  // Make sure that the SMS channel is enabled for the project or application
  // that you choose.
  const appId = "PROJECT_ID";

  // The subject line of the email.
  var subject = "Amazon Pinpoint In Practice";

  // The email body for recipients with non-HTML email clients.
  var body_text = `Amazon Pinpoint Test
----------------------------------------------------
This email was sent using Amazon Pinpoint`;

  // The body of the email for recipients whose email clients support HTML content.
  var body_html = `<html>
<head></head>
<body>
  <h1>Amazon Pinpoint Test</h1>
  <p>This email was sent using Amazon Pinpoint</p>
</body>
</html>`;

  // The AWS Region that you want to use to send the email. For a list of
  // AWS Regions where the Amazon Pinpoint API is available, see
  // https://docs.aws.amazon.com/pinpoint/latest/apireference/
  AWS.config.update({ region: "us-west-2" });

  var pinpoint = new AWS.Pinpoint({ apiVersion: "2016-12-01" });

  // Specify the parameters to pass to the API.
  var params = {
    ApplicationId: appId,
    MessageRequest: {
      Addresses: {
        [toAddress]: {
          ChannelType: "EMAIL",
        },
      },
      MessageConfiguration: {
        EmailMessage: {
          FromAddress: senderAddress,
          SimpleEmail: {
            Subject: {
              Data: subject,
            },
            HtmlPart: {
              Data: body_html,
            },
            TextPart: {
              Data: body_text,
            },
          },
        },
      },
    },
  };

  //Try to send the email.
  var publish = await pinpoint.sendMessages(params).promise();
};
