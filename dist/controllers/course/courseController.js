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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseBySlugAndBatch = exports.updateVideo = exports.deleteContent = exports.deleteModule = exports.deleteMilestone = exports.deleteCourse = exports.updateCourse = exports.getCourseBySlug = exports.getEnrolledCourses = exports.getCoursesByInstructor = exports.getCourseById = exports.getAllCoursesList = exports.getAllCourses = exports.uploadContentToModule = exports.createModule = exports.createMilestone = exports.createCourse = void 0;
const CourseModel_1 = require("../../models/course/CourseModel");
const MilestoneModel_1 = __importDefault(require("../../models/content/MilestoneModel"));
const ModuleModel_1 = __importDefault(require("../../models/content/ModuleModel"));
const slugify_1 = __importDefault(require("slugify"));
const courseValidation_1 = require("../../utils/courseValidation");
const EnrollmentModel_1 = require("../../models/course/EnrollmentModel");
const mongoose_1 = __importDefault(require("mongoose"));
const VideoModel_1 = __importDefault(require("../../models/content/VideoModel"));
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ✅ 1. Validate incoming data using Joi
        const { error, value } = courseValidation_1.courseValidationSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                details: error.details.map((err) => err.message),
            });
        }
        const { title, description, thumbnail, price, isPaid, coursePlan, discount, category, level, duration, hasCertificate, features, milestones, createdBy, isPublished, status, } = value;
        // ✅ 2. Check for duplicate title
        const existingCourse = yield CourseModel_1.Course.findOne({ title });
        if (existingCourse) {
            return res
                .status(409)
                .json({ message: "A course with this title already exists." });
        }
        // ✅ 3. Generate slug
        const slug = (0, slugify_1.default)(title
            .split(" ")
            .map((word) => word[0])
            .join(""), { lower: true });
        const oldPrice = parseInt(price) + 1000;
        // ✅ 4. Create new course instance
        const newCourse = new CourseModel_1.Course({
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
        const savedCourse = yield newCourse.save();
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
    }
    catch (error) {
        console.error("Error creating course:", error);
        return res.status(500).json({
            message: "Course creation failed",
            error: (error === null || error === void 0 ? void 0 : error.message) || error,
        });
    }
});
exports.createCourse = createCourse;
const createMilestone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, title, duration, order = 0, modules = [] } = req.body;
        const milestone = yield MilestoneModel_1.default.create({
            courseId,
            title,
            duration,
            order,
            modules,
        });
        // Update the course with the new milestone ID
        yield CourseModel_1.Course.findByIdAndUpdate(courseId, { $push: { milestones: milestone._id } }, { new: true });
        res.status(201).json({ success: true, data: milestone });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Milestone creation failed", error });
    }
});
exports.createMilestone = createMilestone;
const createModule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { milestoneId, title, type = "video", duration, Videos } = req.body;
        const module = yield ModuleModel_1.default.create({
            milestoneId,
            title,
            type,
            Videos,
            duration,
        });
        yield MilestoneModel_1.default.findByIdAndUpdate(milestoneId, { $push: { modules: module._id } }, { new: true });
        res.status(201).json({ success: true, data: module });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Module creation failed", error });
    }
});
exports.createModule = createModule;
const uploadContentToModule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { moduleId, title, type, description, submissionDate, quizQuestions, } = req.body;
        if (!moduleId || !title || !type) {
            return res.status(400).json({
                message: "Fields 'moduleId', 'title', and 'type' are required.",
            });
        }
        const modules = yield ModuleModel_1.default.findById(moduleId);
        if (!modules) {
            return res.status(404).json({ message: "Module not found." });
        }
        let moduleContent = yield VideoModel_1.default.findOne({ moduleId });
        if (!moduleContent) {
            moduleContent = new VideoModel_1.default({
                moduleId,
                videos: [],
                assignments: [],
                quizzes: [],
            });
        }
        if (type === "video") {
            const { videoId, thumbnail } = req.body;
            console.log('Video upload data:', { title, videoId, thumbnail, type });
            if (!videoId || !thumbnail) {
                return res.status(400).json({
                    message: "Fields 'videoId' and 'thumbnail' are required for video."
                });
            }
            // Generate YouTube URL from videoId
            const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const videoData = {
                title,
                videoId,
                thumbnail,
                url: youtubeUrl
            };
            console.log('Pushing video data:', videoData);
            moduleContent.videos.push(videoData);
        }
        else if (type === "assignment") {
            moduleContent.assignments.push({
                title,
                description: description || "",
                submissionDate,
            });
        }
        else if (type === "quiz") {
            if (!submissionDate) {
                return res
                    .status(400)
                    .json({ message: "submissionDate is required for quiz." });
            }
            if (!quizQuestions) {
                return res.status(400).json({ message: "quizQuestions is required." });
            }
            let questions = [];
            try {
                questions = JSON.parse(quizQuestions);
            }
            catch (_a) {
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
            const validQuestions = [];
            questions.forEach((q, index) => {
                let parsedOptions = q.options;
                if (typeof q.options === "string") {
                    parsedOptions = q.options.split(",").map((opt) => opt.trim());
                }
                if (typeof q.question === "string" &&
                    Array.isArray(parsedOptions) &&
                    parsedOptions.length > 0 &&
                    typeof q.correctAnswer === "string") {
                    validQuestions.push({
                        question: q.question,
                        options: parsedOptions,
                        correctAnswer: q.correctAnswer,
                    });
                }
                else {
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
        }
        else {
            return res.status(400).json({ message: "Invalid content type." });
        }
        yield moduleContent.save();
        yield ModuleModel_1.default.findByIdAndUpdate(moduleId, { $addToSet: { moduleContents: moduleContent._id } }, { new: true });
        return res.status(201).json({
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully.`,
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: "Server error.", error });
    }
});
exports.uploadContentToModule = uploadContentToModule;
const getAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield CourseModel_1.Course.find()
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
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch courses", error });
    }
});
exports.getAllCourses = getAllCourses;
const getAllCoursesList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield CourseModel_1.Course.find({}, "title");
        const count = yield CourseModel_1.Course.countDocuments(); // Get total count
        res.status(200).json({
            message: "Course titles fetched successfully",
            count,
            courses,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch course titles",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getAllCoursesList = getAllCoursesList;
const getCourseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const course = yield CourseModel_1.Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({
            message: "Course retrieved successfully",
            course: course,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch course", error });
    }
});
exports.getCourseById = getCourseById;
const getCoursesByInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { instructorId } = req.params;
        const courses = yield CourseModel_1.Course.find({ createdBy: instructorId }).populate("videos");
        if (!courses.length)
            return res
                .status(404)
                .json({ message: "No courses found for this instructor" });
        res.status(200).json(courses);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch courses", error });
    }
});
exports.getCoursesByInstructor = getCoursesByInstructor;
const getEnrolledCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ message: "Unauthorized access" });
        }
        const enrollments = yield EnrollmentModel_1.Enrollment.find({ user: userId, status: "success", }).populate({
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
        console.log(enrollments, 'fad');
        return res.status(200).json({
            message: "Enrolled courses fetched successfully",
            courses: enrollments,
        });
    }
    catch (error) {
        console.error("❌ Error fetching enrolled courses:", error);
        return res.status(500).json({
            message: "Failed to fetch enrolled courses",
            error: (error === null || error === void 0 ? void 0 : error.message) || "Internal Server Error",
        });
    }
});
exports.getEnrolledCourses = getEnrolledCourses;
const getCourseBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const course = yield CourseModel_1.Course.findOne({ slug })
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
        if (!course)
            return res.status(404).json({ message: "Course not found" });
        res.status(200).json(course);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch course", error });
    }
});
exports.getCourseBySlug = getCourseBySlug;
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const UpdatedData = req.body;
        const existingCourse = yield CourseModel_1.Course.findById(id);
        if (!existingCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (req.body.hasOwnProperty("title") &&
            (req.body.title === null || req.body.title.trim() === "")) {
            return res.status(400).json({ message: "Title cannot be empty" });
        }
        if (req.body.hasOwnProperty("price") &&
            (typeof req.body.price !== "number" || req.body.price < 0)) {
            return res
                .status(400)
                .json({ message: "Price must be a non-negative number" });
        }
        const updatedCourse = yield CourseModel_1.Course.findByIdAndUpdate(id, UpdatedData, {
            new: true,
            runValidators: true,
        });
        return res.status(200).json({
            message: "Course updated successfully",
            course: updatedCourse,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to update course",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updateCourse = updateCourse;
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield CourseModel_1.Course.findByIdAndDelete(id);
        res.status(200).json({ message: "Course deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Course deletion failed", error });
    }
});
exports.deleteCourse = deleteCourse;
const deleteMilestone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield MilestoneModel_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Milesone deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Milesone deletion failed", error });
    }
});
exports.deleteMilestone = deleteMilestone;
const deleteModule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield ModuleModel_1.default.findByIdAndDelete(id);
        res.status(200).json({ message: "Module deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Module deletion failed", error });
    }
});
exports.deleteModule = deleteModule;
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { moduleContentId, videoId } = req.params;
        if (!moduleContentId || !videoId) {
            return res.status(400).json({
                message: "moduleContentId and videoId are required"
            });
        }
        // Find the module content
        const moduleContent = yield VideoModel_1.default.findById(moduleContentId);
        if (!moduleContent) {
            return res.status(404).json({ message: "Module content not found" });
        }
        // Find the video
        const video = moduleContent.videos.find((v) => v._id.toString() === videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        // Remove video from array (no Cloudinary deletion needed for YouTube links)
        moduleContent.videos = moduleContent.videos.filter((v) => v._id.toString() !== videoId);
        yield moduleContent.save();
        res.status(200).json({
            message: "Video deleted successfully",
            moduleContent
        });
    }
    catch (error) {
        console.error("Delete content error:", error);
        res.status(500).json({
            message: "Content deletion failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.deleteContent = deleteContent;
const updateVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { moduleContentId, videoId } = req.params;
        const { title, videoId: newVideoId, thumbnail } = req.body;
        if (!moduleContentId || !videoId) {
            return res.status(400).json({
                message: "moduleContentId and videoId are required"
            });
        }
        // Find the module content
        const moduleContent = yield VideoModel_1.default.findById(moduleContentId);
        if (!moduleContent) {
            return res.status(404).json({ message: "Module content not found" });
        }
        // Find the video index
        const videoIndex = moduleContent.videos.findIndex((v) => v._id.toString() === videoId);
        if (videoIndex === -1) {
            return res.status(404).json({ message: "Video not found" });
        }
        // Update video fields
        if (title) {
            moduleContent.videos[videoIndex].title = title;
        }
        if (newVideoId) {
            moduleContent.videos[videoIndex].videoId = newVideoId;
            moduleContent.videos[videoIndex].url = `https://www.youtube.com/watch?v=${newVideoId}`;
        }
        if (thumbnail) {
            moduleContent.videos[videoIndex].thumbnail = thumbnail;
        }
        yield moduleContent.save();
        res.status(200).json({
            message: "Video updated successfully",
            video: moduleContent.videos[videoIndex]
        });
    }
    catch (error) {
        console.error("Update video error:", error);
        res.status(500).json({
            message: "Video update failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.updateVideo = updateVideo;
// Get course by slug and batch
const getCourseBySlugAndBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug, batch } = req.params;
        // Find the course by slug
        const course = yield CourseModel_1.Course.findOne({ slug })
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
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        // Filter batch data if batch parameter is provided
        if (batch && course.batchData) {
            const batchNumber = parseInt(batch);
            const filteredBatchData = Array.isArray(course.batchData)
                ? course.batchData.filter((b) => b.batchNumber === batchNumber)
                : [];
            const courseData = course.toObject();
            courseData.batchData = filteredBatchData;
            return res.status(200).json(courseData);
        }
        res.status(200).json(course);
    }
    catch (error) {
        console.error("Get course by slug and batch error:", error);
        res.status(500).json({
            message: "Failed to fetch course",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.getCourseBySlugAndBatch = getCourseBySlugAndBatch;
