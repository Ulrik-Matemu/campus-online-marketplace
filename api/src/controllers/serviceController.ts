import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { Types } from 'mongoose';

export const createService = async (req: Request, res: Response) => {
  try {
    const { title, description, category, rate, rateType } = req.body;


    const service = await Service.create({
      title,
      description,
      category,
      rate,
      rateType,
      provider: (req as any).user.id // Taken from the protect middleware
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Error creating service listing", error });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find().populate('provider', 'name campus');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error });
  }
};


export const updateService = async (req: Request, res: Response) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) return res.status(404).json({ message: "Service not found" });

    // Check Ownership: Only owner or admin can edit
    if (service.provider.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(401).json({ message: "Not authorized to edit this listing" });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Service Update failed", error });
  }
};


export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) return res.status(404).json({ message: "Service not found" });

    // Check Ownership
    if (service.provider.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(401).json({ message: "Not authorized to delete this listing" });
    }

    await service.deleteOne();
    res.status(200).json({ message: "Service removed" });
  } catch (error) {
    res.status(500).json({ message: "Service Deletion failed", error });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id).populate('provider', 'name campus phoneNumber');
  if (!service) return res.status(404).json({ message: "Not found" });
  res.json(service);
};

export const getListingsByProvider = async (req: Request, res: Response) => {
  try {
    const userIdString = req.params.userId as string;

    const services = await Service.find({ 
      provider: new Types.ObjectId(userIdString) as any 
    });
    res.json({ services });
  } catch (error) {
    res.status(400).json({ message: "Invalid User ID format" });
  }
};

