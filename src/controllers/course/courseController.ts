import streamifier from "streamifier";
// src/controllers/course.controller.ts
import { Request, Response } from "express";
import { Course } from "../../models/course/CourseModel";
import Milestone from "../../models/content/MilestoneModel";
import Module from "../../models/content/ModuleModel";
import slugify from "slugify";
import { courseValidationSchema } from "../../utils/courseValidation";
import { User } from "../../models/auth/UserModel";
import { Enrollment } from "../../models/course/EnrollmentModel";
import mongoose from "mongoose";
import { IQuiz, QuizQuestion } from "../../interfaces/content/videoInterface";
import cloudinary from "../../utils/cloudinary";
import { uploadFileToCloudinary } from "../../utils/uploadFileToCloudinary";
import ModuleContent from "../../models/content/VideoModel";

export const createCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // ✅ 1. Validate incoming data using Joi
    const { error, value } = courseValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
      });
    }

    const {
      title,
      description,
      thumbnail,
      price,
      isPaid,
      coursePlan,
      discount,
      category,
      level,
      duration,
      hasCertificate,
      features,
      milestones,
      createdBy,
      isPublished,
      status,
    } = value;

    // ✅ 2. Check for duplicate title
    const existingCourse = await Course.findOne({ title });
    if (existingCourse) {
      return res
        .status(409)
        .json({ message: "A course with this title already exists." });
    }

    // ✅ 3. Generate slug
    const slug = slugify(
      title
        .split(" ")
        .map((word: string) => word[0])
        .join(""),
      { lower: true }
    );

    const oldPrice = parseInt(price) + 1000;

    // ✅ 4. Create new course instance
    const newCourse = new Course({
      title,
      slug,
      description,
      thumbnail,
      price,
      oldPrice,
      isPaid,
      coursePlan,
      discount,
      category,
      level,
      duration,
      hasCertificate,
      features,
      milestones,
      createdBy,
      isPublished,
      status,
    });

    // ✅ 5. Save to DB
    const savedCourse = await newCourse.save();

    // ✅ 6. Send success response
    return res.status(201).json({
      message: "Course created successfully",
      course: {
        id: savedCourse._id,
        title: savedCourse.title,
        slug: savedCourse.slug,
        price: savedCourse.price,
        level: savedCourse.level,
        isPublished: savedCourse.isPublished,
      },
    });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      message: "Course creation failed",
      error: error?.message || error,
    });
  }
};

export const createMilestone = async (req: Request, res: Response) => {
  try {
    const { courseId, title, duration, order = 0, modules = [] } = req.body;

    const milestone = await Milestone.create({
      courseId,
      title,
      duration,
      order,
      modules,
    });

    // Update the course with the new milestone ID
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { milestones: milestone._id } },
      { new: true }
    );

    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Milestone creation failed", error });
  }
};

export const createModule = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { milestoneId, title, type = "video", duration, Videos } = req.body;

    const module = await Module.create({
      milestoneId,
      title,
      type,
      Videos,
      duration,
    });

    await Milestone.findByIdAndUpdate(
      milestoneId,
      { $push: { modules: module._id } },
      { new: true }
    );

    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Module creation failed", error });
  }
};

export const uploadContentToModule = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      moduleId,
      title,
      type,
      description,
      submissionDate,
      quizQuestions,
    } = req.body;

    if (!moduleId || !title || !type) {
      return res.status(400).json({
        message: "Fields 'moduleId', 'title', and 'type' are required.",
      });
    }

    const modules = await Module.findById(moduleId);
    if (!modules) {
      return res.status(404).json({ message: "Module not found." });
    }
    let moduleContent = await ModuleContent.findOne({ moduleId });
    if (!moduleContent) {
      moduleContent = new ModuleContent({
        moduleId,
        videos: [],
        assignments: [],
        quizzes: [],
      });
    }
    if (type === "video") {
      if (!req.file) {
        return res.status(400).json({ message: "Video file is required." });
      }
      try {
        const videoUrl = await uploadFileToCloudinary(req.file.buffer, "video");
        moduleContent.videos.push({ title, url: videoUrl });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Video upload failed", error: err });
      }
    } else if (type === "assignment") {
      moduleContent.assignments.push({
        title,
        description: description || "",
        submissionDate,
      });
    } else if (type === "quiz") {
      if (!submissionDate) {
        return res
          .status(400)
          .json({ message: "submissionDate is required for quiz." });
      }

      if (!quizQuestions) {
        return res.status(400).json({ message: "quizQuestions is required." });
      }
      let questions: any[] = [];
      try {
        questions = JSON.parse(quizQuestions);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid JSON in quizQuestions." });
      }
      if (!Array.isArray(questions) || questions.length === 0) {
        return res
          .status(400)
          .json({ message: "quizQuestions must be a non-empty array." });
      }

      if (questions.length > 10) {
        return res
          .status(400)
          .json({ message: "Maximum 10 quiz questions allowed." });
      }

      const validQuestions: QuizQuestion[] = [];
      questions.forEach((q, index) => {
        let parsedOptions = q.options;
        if (typeof q.options === "string") {
          parsedOptions = q.options.split(",").map((opt: string) => opt.trim());
        }

        if (
          typeof q.question === "string" &&
          Array.isArray(parsedOptions) &&
          parsedOptions.length > 0 &&
          typeof q.correctAnswer === "string"
        ) {
          validQuestions.push({
            question: q.question,
            options: parsedOptions,
            correctAnswer: q.correctAnswer,
          });
        } else {
          console.warn(`Skipped invalid quiz question at index ${index}`);
        }
      });

      if (validQuestions.length === 0) {
        return res
          .status(400)
          .json({ message: "No valid quiz questions provided." });
      }
      moduleContent.quizzes.push({
        title: title,
        questions: validQuestions,
        submissionDate,
      });
    } else {
      return res.status(400).json({ message: "Invalid content type." });
    }
    await moduleContent.save();
    await Module.findByIdAndUpdate(
      moduleId,
      { $addToSet: { moduleContents: moduleContent._id } },
      { new: true }
    );
    return res.status(201).json({
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } uploaded successfully.`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

export const getAllCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const courses = await Course.find()
      .populate({
        path: "milestones",
        populate: {
          path: "modules",
          populate: {
            path: "moduleContents",
          },
        },
      })
      .populate("batchData");

    res.status(201).json({
      message: "Course Retrive Successfully",
      courses: courses,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses", error });
  }
};

export const getAllCoursesList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const courses = await Course.find({}, "title"); 
    const count = await Course.countDocuments();     // Get total count

    res.status(200).json({
      message: "Course titles fetched successfully",
      count,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course titles",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getCourseById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Course retrieved successfully",
      course: course,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course", error });
  }
};

export const getCoursesByInstructor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { instructorId } = req.params;
    const courses = await Course.find({ createdBy: instructorId }).populate(
      "videos"
    );
    if (!courses.length)
      return res
        .status(404)
        .json({ message: "No courses found for this instructor" });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses", error });
  }
};

export const getEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const enrollments = await Enrollment.find({ user: userId, status: "success", }).populate({
      path: "course",
      populate: {
        path: "milestones",
        populate: {
          path: "modules",
          populate: {
            path: "moduleContents",
          },
        },
      },
    });

    console.log(enrollments, 'fad')

    return res.status(200).json({
      message: "Enrolled courses fetched successfully",
      courses: enrollments,
    });
  } catch (error: any) {
    console.error("❌ Error fetching enrolled courses:", error);
    return res.status(500).json({
      message: "Failed to fetch enrolled courses",
      error: error?.message || "Internal Server Error",
    });
  }
};

export const getCourseBySlug = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug })
      .populate({
        path: "milestones",
        populate: {
          path: "modules",
          populate: {
            path: "moduleContents",
          },
        },
      })
      .populate("batchData");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course", error });
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const UpdatedData = req.body;
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (
      req.body.hasOwnProperty("title") &&
      (req.body.title === null || req.body.title.trim() === "")
    ) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    if (
      req.body.hasOwnProperty("price") &&
      (typeof req.body.price !== "number" || req.body.price < 0)
    ) {
      return res
        .status(400)
        .json({ message: "Price must be a non-negative number" });
    }
    const updatedCourse = await Course.findByIdAndUpdate(id, UpdatedData, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update course",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Course deletion failed", error });
  }
};

export const deleteMilestone = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    await Milestone.findByIdAndDelete(id);
    res.status(200).json({ message: "Milesone deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Milesone deletion failed", error });
  }
};

export const deleteModule = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    await Module.findByIdAndDelete(id);
    res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Module deletion failed", error });
  }
};

export const deleteContent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    await ModuleContent.findByIdAndDelete(id);
    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Content deletion failed", error });
  }
};
