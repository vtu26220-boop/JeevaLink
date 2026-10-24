import { Request, Response, NextFunction } from 'express';
import { HealthcareResource } from '../models/HealthcareResource';

// Search and list verified healthcare resources
export const getResources = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, city, state, search, page = 1, limit = 12 } = req.query;

    const query: any = { isVerified: true };

    if (category) {
      query.category = category;
    }
    if (city) {
      query.city = { $regex: new RegExp(String(city).trim(), 'i') };
    }
    if (state) {
      query.state = { $regex: new RegExp(String(state).trim(), 'i') };
    }
    if (search) {
      const s = String(search).trim();
      query.$or = [
        { name: { $regex: new RegExp(s, 'i') } },
        { specialties: { $in: [new RegExp(s, 'i')] } },
        { city: { $regex: new RegExp(s, 'i') } },
        { state: { $regex: new RegExp(s, 'i') } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      HealthcareResource.find(query)
        .sort({ isOfficial: -1, state: 1, city: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      HealthcareResource.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single healthcare resource details
export const getResourceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await HealthcareResource.findById(id);

    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};
