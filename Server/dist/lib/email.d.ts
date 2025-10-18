interface WelcomeEmailOptions {
    toEmail: string;
    name?: string;
    message?: string;
}
export declare const sendWelcomeEmail: ({ toEmail, name, message }: WelcomeEmailOptions) => Promise<import("resend").CreateEmailResponse>;
export {};
//# sourceMappingURL=email.d.ts.map