import nodemailer from "nodemailer";
import 'dotenv/config'

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendReportEmail(report) {

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: process.env.EMAIL, 
    subject: `FinOps Report - ${report.date}`,
    text: `
        Hello,

        Your automated FinOps report has been generated successfully.

        Monthly Spend: ${report.total}
        Estimated Savings: ${report.savings}
        Reduction: ${report.reduction}

        The PDF report is attached.

        Regards,
        AI FinOps Pipeline
            `,

    attachments: [
      {
        filename: `finops-report-${report.id}.pdf`,
        content: report.pdf,
      },
    ],
  });

  console.log("📧 Email sent successfully");
}