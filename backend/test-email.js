import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "amarnadhchow@gmail.com",
        pass: "gawcvlvnhhirnhkm", // ✅ Replace with your Google App Password
    },
});

const mailOptions = {
    from: '"FOOD FUSION" <amarnadhchow@gmail.com>',
    to: "amarnadhchow@gmail.com",
    subject: "Test Email",
    text: "This is a test email from Nodemailer.",
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.error("❌ Test email error:", error);
    }
    console.log("✅ Test email sent:", info.response);
});
