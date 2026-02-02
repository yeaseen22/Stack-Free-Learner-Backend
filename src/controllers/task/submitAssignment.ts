import { Request, Response } from "express";
import { AssignmentSubmission } from "../../models/task/AssignmentSubmission";
import { User } from "../../models/auth/UserModel";

// Submit an assignment
export const submitAssignment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      // assignmentId,
      assignmentNo,
      assignmentTitle,
      submissionLink,
      batch,
      assignmentId,
      course,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the assignment is already submitted by this user
    const existingSubmission = await AssignmentSubmission.findOne({
      // assignmentId,
      user: userData._id,
      assignmentNo: assignmentNo,
      assignmentTitle: assignmentTitle,
      batch: batch,
      assignmentId: assignmentId,
      isSubmitted: true,
    });

    if (existingSubmission) {
      return res.status(400).json({
        message:
          "Assignment already submitted. Duplicate submission not allowed.",
      });
    }

    const newSubmission = new AssignmentSubmission({
      // assignmentId,
      assignmentNo,
      assignmentTitle,
      submissionLink,
      assignmentId,
      user: userId,
      batch,
      course,
      isSubmitted: true,
      submittedAt: new Date(),
    });

    await newSubmission.save();

    res.status(201).json({
      message: "Assignment submitted successfully",
      data: newSubmission,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit assignment", error });
  }
};

// Get all submissions
export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await AssignmentSubmission.find()
      .populate("user", "name -_id")
      .populate("course", "title -_id")
      .sort({
        submittedAt: -1,
      });
    res.status(200).json(submissions);
  } catch (error: any) {
    console.error("Fetch Error:", error);
    res.status(500).json({
      message: "Failed to fetch submissions",
      error: error.message || "Unknown error",
    });
  }
};

// Get my submissions
export const getUserSubmissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { assignmentId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const submissions = await AssignmentSubmission.find({
      assignmentId: assignmentId,
      user: user._id,
      isSubmitted: true,
    }).sort({ submittedAt: -1 });
    res.status(200).json({ submissions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user submissions", error });
  }
};

// Update mark
export const updateAssignmentMark = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { mark } = req.body;

    const updatedSubmission = await AssignmentSubmission.findByIdAndUpdate(
      id,
      { mark },
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json({ message: "Mark updated", data: updatedSubmission });
  } catch (error) {
    res.status(500).json({ message: "Failed to update mark", error });
  }
};

export const getMyAssignmentSubmissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }
    const submissions = await AssignmentSubmission.find({
      user: userId,
      isSubmitted: true,
    }).sort({ submittedAt: -1 });
    res.status(200).json({ submissions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user submissions", error });
  }
};
