"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBatchAnnouncement = void 0;
const EnrollmentModel_1 = require("../../models/course/EnrollmentModel");
const UserModel_1 = require("../../models/auth/UserModel");
const CourseModel_1 = require("../../models/course/CourseModel");
const email_1 = require("../../constant/email");
const announcement_1 = require("../../templates/announcement");
// export const allStudentEmailsForBroadcast = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     // Extract announcement details from request body
//     const { announcementTitle, announcementContent, instructorName } = req.body;
//     if (!announcementTitle || !announcementContent) {
//       return res.status(400).json({
//         success: false,
//         message: "Announcement title and content are required",
//       });
//     }
//     const enrollments = await Enrollment.find({})
//       .populate<{ user: IUser }>({
//         path: "user",
//         select: "email name",
//         model: User,
//       })
//       .populate<{ course: ICourse }>({
//         path: "course",
//         select: "title code",
//         model: Course,
//       });
//     // Group by course and batch
//     const groupedEmails = enrollments.reduce(
//       (acc, enroll) => {
//         const courseTitle = enroll.course?.title || "Unknown Course";
//         const batch = enroll.batch || "No Batch";
//         const email = enroll.user?.email;
//         const name = enroll.user?.name || "Student";
//         // Skip if no email
//         if (!email) return acc;
//         // Initialize course if not exists
//         if (!acc[courseTitle]) {
//           acc[courseTitle] = {
//             batches: {},
//           };
//         }
//         // Initialize batch if not exists
//         if (!acc[courseTitle].batches[batch]) {
//           acc[courseTitle].batches[batch] = [];
//         }
//         // Add email to the batch
//         acc[courseTitle].batches[batch].push({
//           email,
//           name,
//         });
//         return acc;
//       },
//       {} as Record<
//         string,
//         {
//           batches: Record<
//             string,
//             Array<{
//               email: string;
//               name: string;
//             }>
//           >;
//         }
//       >
//     );
//     // Convert to array format and send emails
//     const result = Object.entries(groupedEmails).map(
//       ([courseTitle, courseData]) => ({
//         courseTitle,
//         batches: Object.entries(courseData.batches).map(
//           ([batch, students]) => ({
//             batch,
//             students,
//             count: students.length,
//           })
//         ),
//       })
//     );
//     // Send emails to each student in each batch
//     const emailPromises = result.flatMap((course) =>
//       course.batches.flatMap((batch) =>
//         batch.students.map((student) =>
//           sendEmail({
//             to: student.email,
//             subject: `[${course.courseTitle} - Batch ${batch.batch}] ${announcementTitle}`,
//             html: announcementTemplate({
//               name: student.name,
//               courseTitle: course.courseTitle,
//               batch: batch.batch,
//               announcementTitle,
//               announcementContent,
//               instructorName: instructorName || "Course Instructor",
//               announcementDate: new Date().toLocaleDateString(),
//             }),
//           }).catch((error) => {
//             console.error(`Failed to send email to ${student.email}:`, error);
//             return {
//               success: false,
//               email: student.email,
//               error: error.message,
//             };
//           })
//         )
//       )
//     );
//     // Wait for all emails to be sent
//     const emailResults = await Promise.all(emailPromises);
//     // Count successful/failed emails
//     const failedEmails = emailResults.filter((result) => !result?.success);
//     const successfulCount = emailResults.length - failedEmails.length;
//     return res.status(200).json({
//       success: true,
//       message: `Announcement sent successfully to ${successfulCount} students. ${failedEmails.length} failed.`,
//       data: {
//         totalRecipients: emailResults.length,
//         successful: successfulCount,
//         failed: failedEmails.length,
//         failedEmails: failedEmails
//           .filter(
//             (f): f is { success: false; email: string; error: any } =>
//               !!f && typeof f.email === "string"
//           )
//           .map((f) => ({ email: f.email, error: f.error })),
//         announcementDetails: {
//           title: announcementTitle,
//           content: announcementContent,
//           instructor: instructorName || "Course Instructor",
//           date: new Date().toLocaleDateString(),
//         },
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error sending announcements",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };
const sendBatchAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract announcement details from request body
        const { courseId, batch, announcementTitle, announcementContent, instructorName } = req.body;
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
        const course = yield CourseModel_1.Course.findById(courseId).select("title code");
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        // Get all enrollments for the specified course and batch
        const enrollments = yield EnrollmentModel_1.Enrollment.find({
            course: courseId,
            batch: batch
        })
            .populate({
            path: "user",
            select: "email name",
            model: UserModel_1.User,
        });
        // Filter out enrollments without email and map to student list
        const students = enrollments
            .filter(enroll => { var _a; return (_a = enroll.user) === null || _a === void 0 ? void 0 : _a.email; })
            .map(enroll => {
            var _a, _b;
            return ({
                email: (_a = enroll.user) === null || _a === void 0 ? void 0 : _a.email,
                name: ((_b = enroll.user) === null || _b === void 0 ? void 0 : _b.name) || "Student"
            });
        });
        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No students found for the specified course and batch",
            });
        }
        // Send emails to each student in the batch
        const emailPromises = students.map(student => (0, email_1.sendEmail)({
            to: student.email,
            subject: `[${course.title} - Batch ${batch}] ${announcementTitle}`,
            html: (0, announcement_1.announcementTemplate)({
                name: student.name,
                courseTitle: course.title,
                batch: batch,
                announcementTitle,
                announcementContent,
                instructorName: instructorName || "Course Instructor",
                announcementDate: new Date().toLocaleDateString(),
            }),
        }).catch(error => {
            console.error(`Failed to send email to ${student.email}:`, error);
            return {
                success: false,
                email: student.email,
                error: error.message,
            };
        }));
        // Wait for all emails to be sent
        const emailResults = yield Promise.all(emailPromises);
        // Count successful/failed emails
        const failedEmails = emailResults.filter(result => !(result === null || result === void 0 ? void 0 : result.success));
        const successfulCount = emailResults.length - failedEmails.length;
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
                    .filter((f) => !!f && typeof f.email === "string")
                    .map(f => ({
                    email: f.email,
                    error: f.error
                })),
                announcementDetails: {
                    title: announcementTitle,
                    content: announcementContent,
                    instructor: instructorName || "Course Instructor",
                    date: new Date().toLocaleDateString()
                }
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error sending batch announcement",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.sendBatchAnnouncement = sendBatchAnnouncement;
