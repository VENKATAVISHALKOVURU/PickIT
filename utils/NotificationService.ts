export const NotificationService = {
    sendEmail: (to: string, subject: string, body: string) => {
        // In a real app, this would fetch to a backend.
        // Here we simulate the network delay and success.
        console.log(`[EMAIL SERVICE] Sending to ${to}...`);
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const message = `📧 EMAIL SENT TO: ${to}\nSUBJECT: ${subject}\n\n${body}`;
                alert(message); // Using native alert for "Clearly Labeled Mock" as requested
                resolve();
            }, 800);
        });
    },

    sendSMS: (to: string, body: string) => {
        console.log(`[SMS SERVICE] Sending to ${to}...`);
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const message = `📱 SMS SENT TO: ${to}\n\n${body}`;
                alert(message);
                resolve();
            }, 800);
        });
    }
};
