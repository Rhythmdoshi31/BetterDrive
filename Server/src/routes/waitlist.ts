import { Router } from 'express';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const router: Router = Router();
const prisma = new PrismaClient();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email template function
const createEmailTemplate = (name: string, position: number, email: string) => {
  const message = `Thanks for joining our VIP list! You're #${position} in line for early access to BetterDrive.`;
  const fromName = "BetterDrive Team";

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto;">
    
    <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      
      <!-- Simple Header -->
      <div style="background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #f1f5f9;">
        <h1 style="color: #1f2937; margin: 0 0 8px 0; font-size: 32px; font-weight: 600; line-height: 1.2;">
          🎉 Hey ${name}!
        </h1>
        <p style="color: #6b7280; margin: 0; font-size: 18px; line-height: 1.4;">
          Welcome to the <span style="color: #3b82f6; font-weight: 600;">BetterDrive</span> family
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 40px 30px; background-color: #ffffff;">
        
        <!-- Message -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 30px 0; border-left: 3px solid #3b82f6;">
          <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6;">
            ${message}
          </p>
          <div style="margin: 16px 0 0 0; padding: 16px 0 0 0; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px; font-style: italic; line-height: 1.5;">
              P.S. - We're genuinely excited to have you with us on this journey! 🚀
            </p>
          </div>
        </div>

        <!-- What's Next -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin: 0 0 30px 0; border: 1px solid #f1f5f9;">
          <div style="margin: 0 0 20px 0;">
            <h3 style="color: #1f2937; margin: 0; font-size: 20px; font-weight: 600; line-height: 1.3;">What's coming your way?</h3>
          </div>
          
          <div>
            <div style="margin: 0 0 12px 0;">
              <span style="color: #1d4ed8; font-weight: 600; font-size: 15px;">First-class access</span>
              <span style="color: #4b5563; margin-left: 8px; font-size: 15px;">when we launch</span>
            </div>
            <div style="margin: 0 0 12px 0;">
              <span style="color: #1d4ed8; font-weight: 600; font-size: 15px;">VIP-only features</span>
              <span style="color: #4b5563; margin-left: 8px; font-size: 15px;">& exclusive updates</span>
            </div>
            <div style="margin: 0 0 12px 0;">
              <span style="color: #1d4ed8; font-weight: 600; font-size: 15px;">Direct line to our team</span>
              <span style="color: #4b5563; margin-left: 8px; font-size: 15px;">for your feedback</span>
            </div>
            <div style="margin: 0;">
              <span style="color: #1d4ed8; font-weight: 600; font-size: 15px;">Special surprises</span>
              <span style="color: #4b5563; margin-left: 8px; font-size: 15px;">just for early supporters</span>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin: 0 0 30px 0;">
          <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 16px; font-style: italic; line-height: 1.5;">
            Want to see what we're building? 👀
          </p>
          <a href="https://betterdrive.com" target="_blank" style="display: inline-block; text-decoration: none; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 16px; line-height: 1; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);">
            Take a peek at BetterDrive →
          </a>
        </div>

        <!-- Contact -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin: 0; border: 1px solid #f1f5f9;">
          <div style="margin: 0 0 12px 0;">
            <span style="font-size: 24px;">🤗</span>
          </div>
          <p style="color: #374151; margin: 0; font-size: 15px; line-height: 1.6;">
            Have questions? Just hit reply - a real human (that's me!) will get back to you personally.
          </p>
          <div style="margin: 16px 0 0 0; padding: 16px 0 0 0; border-top: 1px solid #e5e7eb;">
            <p style="color: #1f2937; margin: 0; font-size: 16px; font-weight: 600; line-height: 1.4;">
              Thanks for believing in us! 💙
            </p>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #4b5563; margin: 0 0 12px 0; font-size: 18px; font-weight: 500; line-height: 1.3;">
          With gratitude & excitement,
        </p>
        <p style="color: #1d4ed8; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; line-height: 1.2;">
          ${fromName} 💙
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; padding: 20px 0 0 0; margin: 20px 0 0 0;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">
            You're receiving this because you joined our VIP list at <span style="color: #1d4ed8;">${email}</span>
            <br><br>
            <span style="color: #6b7280;">Made with love by the BetterDrive team</span> ✨
          </p>
        </div>
      </div>

    </div>
  </div>
</div>

  `;
};

// GET /api/wishlist/count - Get waitlist count
router.get('/count', async (req: Request, res: Response) => {
  try {
    const count = await prisma.waitlist.count();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get waitlist count error:', error);
    res.status(500).json({ success: false, message: 'Failed to get count' });
  }
});

// POST /api/wishlist - Join waitlist
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Check if email already exists
    const existingUser = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered in the VIP List' 
      });
    }

    // Add to database
    const waitlistUser = await prisma.waitlist.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
      }
    });

    const totalCount = await prisma.waitlist.count();

    // Send email
    const htmlTemplate = createEmailTemplate(name.trim(), totalCount, email.toLowerCase().trim());

    await transporter.sendMail({
      from: `"BetterDrive Team" <${process.env.EMAIL_USER}>`,
      to: email.toLowerCase().trim(),
      subject: '🎉 Welcome to the BetterDrive VIP List!',
      html: htmlTemplate,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        id: waitlistUser.id,
        name: waitlistUser.name,
        email: waitlistUser.email,
        position: totalCount,
        joinedAt: waitlistUser.createdAt
      }
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
});

export default router;
