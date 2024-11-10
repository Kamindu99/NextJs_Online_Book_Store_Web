const Product = require('./models/BookTransferModel');
const BookModel = require('./models/BookModel');
const UserModel = require('./models/UserModel');
const nodemailer = require('nodemailer');

// Configure your SMTP transport
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "wanigasinghebookcollection@gmail.com",
        pass: 'rkpc rkjt uhth fiak'
    },
});

// Function to send reminder emails for overdue books
const sendReminderEmails = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
        // Find books that are active (i.e., not returned)
        const overdueBooks = await Product.find({ isActive: true });

        for (const overdueBook of overdueBooks) {
            const userDetails = await UserModel.findById(overdueBook.userId);
            const bookDetails = await BookModel.findById(overdueBook.bookId);

            const reminderMailOptions = {
                from: 'wanigasinghebookcollection@gmail.com',
                to: userDetails.email,
                subject: 'Reminder: Book Return Due',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #FF0000;">Reminder to Return Book</h2>
                        <p>Dear ${userDetails.firstName} ${userDetails.lastName},</p>
                        <p>This is a reminder that the book you borrowed from Wanigasinghe Books Collection is due for return:</p>
                        <ul>
                            <li>Book Code: ${bookDetails.bookCode}</li>
                            <li>Book Name: ${bookDetails.bookName}</li>
                            <li>Return Date: ${overdueBook.returnDate}</li>
                        </ul>
                        <p>Please return the book on time to avoid any penalties.</p>
                    </div>
                `,
            };

            // Send the reminder email
            await transporter.sendMail(reminderMailOptions);
            console.log('Reminder email sent successfully to:', userDetails.email);
        }
    } catch (error) {
        console.error('Failed to send reminder emails:', error);
    }
};

async function cronJobs(req, res) {
    try {
        await sendReminderEmails(); // Function that contains your email sending logic
        res.status(200).json({ message: 'Reminder emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Failed to send emails' });
    }
}

module.exports = cronJobs;