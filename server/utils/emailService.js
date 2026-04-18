import nodemailer from 'nodemailer';

export const sendCredentialEmail = async ({ to, cc, name, email, password, role, loginUrl }) => {
    let transporter;
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Fallback for resilient local development/testing if no ENV vars
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user, 
                pass: testAccount.pass,
            },
        });
    }

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border-radius: 12px; border: 1px solid #e5e7eb; background: #ffffff;">
            <h2 style="color: #111827; font-size: 24px; font-weight: 800; margin-top: 0;">Account Provisioned</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Your account has been officially created in the Digital Processing Compliance (DPC) Tool by your administrator.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #4f46e5; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800;">Secure Login Details</h3>
                <ul style="list-style: none; padding: 0; margin: 0; color: #334155; font-size: 15px;">
                    <li style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;"><strong>Email Address:</strong> <a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></li>
                    <li style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;"><strong>Assigned Role:</strong> ${role}</li>
                    <li style="margin-bottom: 0;"><strong>Temporary Password:</strong> <span style="background: #1e293b; color: #38bdf8; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 16px;">${password}</span></li>
                </ul>
            </div>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 25px;">
                <p style="color: #991b1b; font-weight: bold; font-size: 13px; margin: 0;">SECURITY REQUIREMENT</p>
                <p style="color: #b91c1c; font-size: 13px; margin: 4px 0 0 0;">Please login immediately and process an initial password reset. Leaving temporary credentials active poses a compliance risk.</p>
            </div>
            
            <div style="text-align: center; margin-top: 35px; margin-bottom: 15px;">
                <a href="${loginUrl}" target="_blank" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Access Dashboard →</a>
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"DPC Tool Security" <noreply@dpctool.com>',
        to,
        subject: 'Your Account Has Been Created – DPC ToolCredentials',
        html: htmlContent,
    };
    
    // Add optional CC mapping
    if (cc) {
        mailOptions.cc = cc;
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Credentials sent to ${to}. ID: ${info.messageId}`);
        // If ethereal, provide the URL to the web interface to view the mock email
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log(`[EMAIL_MOCK] View Email Preview at: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error);
    }
};

export const sendCriticalNotification = async ({ recipients, requestData, creatorName }) => {
    let transporter;
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user, 
                pass: testAccount.pass,
            },
        });
    }

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border-radius: 12px; border: 1px solid #fee2e2; background: #fffcfc;">
            <div style="background-color: #ef4444; color: white; padding: 10px 20px; border-radius: 8px; display: inline-block; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;">
                CRITICAL RISK ALERT
            </div>
            
            <h2 style="color: #111827; font-size: 22px; font-weight: 800; margin-top: 0;">Urgent Review Required</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">A new change request has been submitted with <strong>CRITICAL</strong> risk level and requires immediate attention.</p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #fecaca; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <h3 style="margin-top: 0; color: #ef4444; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; border-bottom: 2px solid #fee2e2; padding-bottom: 8px;">Request Summary</h3>
                <ul style="list-style: none; padding: 0; margin: 0; color: #334155; font-size: 15px;">
                    <li style="margin-bottom: 12px; margin-top: 12px;"><strong>Title:</strong> ${requestData.title}</li>
                    <li style="margin-bottom: 12px;"><strong>Submitted By:</strong> ${creatorName}</li>
                    <li style="margin-bottom: 12px;"><strong>Change Type:</strong> ${requestData.changeType}</li>
                    <li style="margin-bottom: 0;"><strong>Submission Date:</strong> ${new Date().toLocaleString()}</li>
                </ul>
            </div>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>Justification:</strong> ${requestData.justification}</p>
            </div>
            
            <div style="text-align: center; margin-top: 35px;">
                <a href="${process.env.FRONTEND_URL || 'https://digital-processing-compliance-tool.netlify.app'}/requests" style="background-color: #111827; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; font-size: 14px;">Review Request →</a>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
                This is an automated high-priority notification from the ChangeFlow Compliance Engine.
            </p>
        </div>
    `;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"ChangeFlow Emergency" <critical@changeflow.com>',
        to: recipients.join(', '),
        subject: `CRITICAL ALERT: ${requestData.title}`,
        html: htmlContent,
        priority: 'high'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[CRITICAL EMAIL] Notification sent to ${recipients.length} recipients. ID: ${info.messageId}`);
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log(`[CRITICAL EMAIL_MOCK] Preview: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        console.error(`[CRITICAL EMAIL ERROR] Failed to send notification:`, error);
    }
};
