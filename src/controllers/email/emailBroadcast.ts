import { Request, Response } from "express";
import { Enrollment } from "../../models/course/EnrollmentModel";
import { IUser } from "../../interfaces/auth/userInterface";
import { User } from "../../models/auth/UserModel";
import { Course } from "../../models/course/CourseModel";
import { sendEmail } from "../../constant/email";
import { announcementTemplate } from "../../templates/announcement";
import Announcement from "../../models/email/AnnouncementModel";
import { TEmailResult } from "../../interfaces/email/emailAnnouncementInterface";

export const sendBatchAnnouncement = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // Extract announcement details from request body
    const {
      courseId,
      batch,
      announcementTitle,
      announcementContent,
      instructorName,
    } = req.body;

    // Validate required fields
    if (!courseId || !batch) {
      return res.status(400).json({
        success: false,
        message: "Course ID and batch are required",
      });
    }

    if (!announcementTitle || !announcementContent) {
      return res.status(400).json({
        success: false,
        message: "Announcement title and content are required",
      });
    }

    // Find the course to get its title
    const course = await Course.findById(courseId).select("title code");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get all enrollments for the specified course and batch
    const enrollments = await Enrollment.find({
      course: courseId,
      batch: batch,
    }).populate<{ user: IUser }>({
      path: "user",
      select: "email name",
      model: User,
    });

    // Filter out enrollments without email and map to student list
    const students = enrollments
      .filter((enroll) => enroll.user?.email)
      .map((enroll) => ({
        email: enroll.user?.email as string,
        name: enroll.user?.name || "Student",
      }));

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for the specified course and batch",
      });
    }

    // Send emails to each student in the batch
    const emailPromises: Promise<TEmailResult>[] = students.map((student) =>
      sendEmail({
        to: student.email,
        // subject: `[${course.title} - Batch ${batch}] ${announcementTitle}`,
        subject: `${announcementTitle}`,
        html: announcementTemplate({
          name: student.name,
          courseTitle: course.title,
          batch: batch,
          announcementTitle,
          announcementContent,
          instructorName: instructorName || "Course Instructor",
          announcementDate: new Date().toLocaleDateString(),
        }),
      })
        .then<TEmailResult>(() => ({
          success: true,
          email: student.email,
        }))
        .catch<TEmailResult>((error) => {
          console.error(`Failed to send email to ${student.email}:`, error);
          return {
            success: false,
            email: student.email,
            error: error.message,
          };
        })
    );

    // Wait for all emails to be sent
    const emailResults = await Promise.all(emailPromises);

    // Count successful/failed emails
    const failedEmails = emailResults.filter((result) => !result?.success);
    const successfulCount = emailResults.length - failedEmails.length;

    await Announcement.create({
      course: course._id,
      courseName: course.title,
      batch,
      announcementTitle,
      announcementContent,
      instructorName: instructorName || "Course Instructor",
      recipients: emailResults.map((result, index) => ({
        email: students[index].email,
        name: students[index].name,
        success: result?.success !== false,
        error: result?.success === false ? result.error : undefined,
      })),
      totalRecipients: emailResults.length,
      successful: successfulCount,
      failed: failedEmails.length,
    });

    return res.status(200).json({
      success: true,
      message: `Announcement sent successfully to ${successfulCount} students in ${course.title} - Batch ${batch}. ${failedEmails.length} failed.`,
      data: {
        course: course.title,
        batch: batch,
        totalRecipients: emailResults.length,
        successful: successfulCount,
        failed: failedEmails.length,
        failedEmails: failedEmails
          .filter(
            (f): f is { success: false; email: string; error: any } =>
              !!f && typeof f.email === "string"
          )
          .map((f) => ({
            email: f.email,
            error: f.error,
          })),
        announcementDetails: {
          title: announcementTitle,
          content: announcementContent,
          instructor: instructorName || "Course Instructor",
          date: new Date().toLocaleDateString(),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending batch announcement",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
