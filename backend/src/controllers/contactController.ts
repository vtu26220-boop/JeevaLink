import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { contactMessageSchema } from '../validators/schemas';

// Submit public contact message
export const submitContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = contactMessageSchema.parse(req.body);

    const contactMessage = await ContactMessage.create({
      fullName: validatedData.fullName,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      ipAddress: req.ip,
      status: 'New',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. Your message has been received by the JeevaLink support team.',
      id: contactMessage._id,
    });
  } catch (error) {
    next(error);
  }
};
