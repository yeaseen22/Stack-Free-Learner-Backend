import { Request, Response } from "express";
import { User } from "../../models/auth/UserModel";
import { Types } from "mongoose";
import Batch from "../../models/course/BatchModel";

export const assignInstructorsToBatch = async (req: Request, res: Response): Promise<any> => {
  try {
    const { batchId } = req.params;
    const { instructorIds, courseId } = req.body;

    // Validation batch ID
    if (!Types.ObjectId.isValid(batchId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid batch ID." });
    }

    // Validate course ID
    if (!Types.ObjectId.isValid(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID." });
    }

    if (!Array.isArray(instructorIds) || instructorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Instructor IDs must be a non-empty array.",
      });
    }

    // Step 1: Check if instructors already assigned
    const existingBatch = await Batch.findById(batchId).populate(
      "instructors",
      "name email"
    );

    if (!existingBatch) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found." });
    }

    if (existingBatch.instructors && existingBatch.instructors.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Instructors are already assigned to this batch.",
        // data: existingBatch,
      });
    }

    // Step 2: Proceed to assign instructors
    const updatedBatch = await Batch.findByIdAndUpdate(
      batchId,
      { instructors: instructorIds },
      { new: true }
    )
      .populate("instructors", "name email")
      .populate("course", "title");

    if (!updatedBatch) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Instructors assigned successfully.",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Error assigning instructors:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const unassignInstructorFromBatch = async (req: Request, res: Response): Promise<any> => {
  try {
    const { batchId, instructorId } = req.params;

    // Validate IDs
    if (!Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ success: false, message: "Invalid batch ID." });
    }

    if (!Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ success: false, message: "Invalid instructor ID." });
    }

    // Find the batch first
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    // Check if instructor is actually assigned
    const isAssigned = batch.instructors.includes(new Types.ObjectId(instructorId));
    if (!isAssigned) {
      return res.status(400).json({ success: false, message: "Instructor not assigned to this batch." });
    }

    // Remove instructor from the list
    batch.instructors = batch.instructors.filter((id: any) => id.toString() !== instructorId);
    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Instructor unassigned successfully.",
      // data: batch
    });
  } catch (error) {
    console.error("Error unassigning instructor:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const allInstructorInfo = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const instructors = await User.aggregate([
      { $match: { role: "instructor" } },
      {
        $lookup: {
          from: "batches", 
          localField: "_id",
          foreignField: "instructors",
          as: "instructorBatches"
        }
      },
      {
        $unwind: {
          path: "$instructorBatches",
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        $lookup: {
          from: "courses", 
          localField: "instructorBatches.course",
          foreignField: "_id",
          as: "instructorBatches.courseInfo"
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          isBlocked: { $first: "$isBlocked" },
          phone: { $first: "$phone" },
          userId: { $first: "$userId" },
          gender: { $first: "$gender" },
          district: { $first: "$district" },
          batches: {
            $push: {
              $cond: [
                { $ifNull: ["$instructorBatches", false] },
                {
                  batchId: "$instructorBatches._id",
                  batchNo: "$instructorBatches.batchNo",
                  courseName: { $arrayElemAt: ["$instructorBatches.courseInfo.title", 0] }
                },
                null
              ]
            }
          }
        }
      },
      {
        $addFields: {
          batches: {
            $filter: {
              input: "$batches",
              as: "batch",
              cond: { $ne: ["$$batch", null] }
            }
          },
          batchCount: {
            $size: {
              $filter: {
                input: "$batches",
                as: "batch",
                cond: { $ne: ["$$batch", null] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          userId: 1,
          isBlocked:1,
          gender: 1,
          district: 1,
          batchCount: 1,
          batches: 1
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    const totalInstructors = await User.countDocuments({ role: "instructor" });

    return res.status(200).json({
      success: true,
      message: "All instructor info retrieved successfully",
      data: {
        stats: {
          totalInstructors,
        },
        instructors: instructors.map(instructor => ({
          id: instructor._id,
          name: instructor.name,
          isBlocked:instructor.isBlocked,
          email: instructor.email,
          phone: instructor.phone,
          regNo: instructor.userId,
          gender: instructor.gender,
          district: instructor.district,
          batchCount: instructor.batchCount,
          batches: instructor.batches
        }))
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving instructor info",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getInstructorDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const { instructorId } = req.params;

    // Validate instructor ID
    if (!Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid instructor ID." 
      });
    }

    // Aggregation pipeline to get detailed instructor info
    const instructor = await User.aggregate([
      // Stage 1: Match the specific instructor
      { 
        $match: { 
          _id: new Types.ObjectId(instructorId),
          role: "instructor" 
        } 
      },
      
      // Stage 2: Lookup batches assigned to this instructor
      {
        $lookup: {
          from: "batches",
          localField: "_id",
          foreignField: "instructors",
          as: "batches"
        }
      },
      
      // Stage 3: Unwind batches array to process each batch
      { 
        $unwind: {
          path: "$batches",
          preserveNullAndEmptyArrays: true // Keep instructor even if no batches
        } 
      },
      
      // Stage 4: Lookup course info for each batch
      {
        $lookup: {
          from: "courses",
          localField: "batches.course",
          foreignField: "_id",
          as: "batches.courseInfo"
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          phone: { $first: "$phone" },
          userId: { $first: "$userId" },
          address: { $first: "$address" },
          country: { $first: "$country" },
          gender: { $first: "$gender" },
          district: { $first: "$district" },
          batches: {
            $push: {
              $cond: [
                { $ifNull: ["$batches", false] },
                {
                  batchId: "$batches._id",
                  batchNo: "$batches.batchNo",
                  batchName: "$batches.name",
                  startDate: "$batches.startDate",
                  endDate: "$batches.endDate",
                  course: {
                    $arrayElemAt: ["$batches.courseInfo", 0]
                  }
                },
                null
              ]
            }
          }
        }
      },
      
      // Stage 6: Filter out null batches and add count
      {
        $addFields: {
          batches: {
            $filter: {
              input: "$batches",
              as: "batch",
              cond: { $ne: ["$$batch", null] }
            }
          },
          batchCount: { $size: "$batches" }
        }
      },
      
      // Stage 7: Project final fields
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          gender: 1,
          district: 1,
          userId: 1,
          address: 1,
          country: 1,
          batchCount: 1,
          batches: {
            $map: {
              input: "$batches",
              as: "batch",
              in: {
                batchId: "$$batch.batchId",
                batchNo: "$$batch.batchNo",
                batchName: "$$batch.batchName",
                startDate: "$$batch.startDate",
                endDate: "$$batch.endDate",
                courseId: "$$batch.course._id",
                courseName: "$$batch.course.title",
                courseCode: "$$batch.course.code"
              }
            }
          }
        }
      }
    ]);

    // Check if instructor was found
    if (!instructor || instructor.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Instructor not found." 
      });
    }

    // Return the formatted instructor data
    return res.status(200).json({
      success: true,
      message: "Instructor details retrieved successfully",
      data: instructor[0] // Since aggregate returns an array
    });

  } catch (error) {
    console.error("Error fetching instructor details:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving instructor details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};