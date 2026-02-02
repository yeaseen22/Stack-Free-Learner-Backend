import { Request, Response } from "express";
import mongoose from "mongoose";
import Batch from "../../models/course/BatchModel";
import { Course } from "../../models/course/CourseModel";


// ✅ Create a new batch
export const createBatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      course, 
      batchNo,
      startDate,
      endDate,
      status,
      orientationDate,
      classStartDate,
      enrolledStudents,
    } = req.body;

    const newBatch = new Batch({
      course,
      batchNo,
      startDate,
      endDate,
      orientationDate,
      classStartDate,
      status,
      enrolledStudents,
    });

    const savedBatch = await newBatch.save();

    // ✅ Update Course's batchData array with new batch ID
    await Course.findByIdAndUpdate(
      course,
      { $push: { batchData: savedBatch._id } },
      { new: true, useFindAndModify: false }
    );

    res.status(201).json({
      success: true,
      message: "Batch created and course updated successfully",
      data: savedBatch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Batch creation failed",
      error: (error as Error).message,
    });
  }
};

// ✅ Get all batches
export const getAllBatches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const batches = await Batch.find()
      .populate("course")
      .populate("enrolledStudents");

      

    res.status(200).json({
      success: true,
      message: "All batches fetched successfully",
      batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
      error: (error as Error).message,
    });
  }
};

// ✅ Get single batch by ID
export const getBatchById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
      return;
    }

    const batch = await Batch.findById(id)
      .populate("course")
      .populate("enrolledStudents");

    if (!batch) {
      res.status(404).json({
        success: false,
        message: "Batch not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Batch fetched successfully",
      data: batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch batch",
      error: (error as Error).message,
    });
  }
};

// ✅ Update a batch
export const updateBatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
      return;
    }

    const updatedBatch = await Batch.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBatch) {
      res.status(404).json({
        success: false,
        message: "Batch not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: updatedBatch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update batch",
      error: (error as Error).message,
    });
  }
};

// ✅ Delete a batch
export const deleteBatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
      return;
    }

    const deletedBatch = await Batch.findByIdAndDelete(id);

    if (!deletedBatch) {
      res.status(404).json({
        success: false,
        message: "Batch not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete batch",
      error: (error as Error).message,
    });
  }
};
