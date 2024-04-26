import { Elysia } from 'elysia'
import { Lesson } from "../schemas/lesson.js";

export const lessons_router = new Elysia({ prefix: '/lessons' })
    .get("/", async () => {
        return await Lesson.find();
    })
    .post("/", async ({ body, set }) => {
        // Not yet
        set.status = 400;
        // Input from body
        let newLesson = new Lesson();
        newLesson.classroom = body.classroom;
        newLesson.subject = body.subject;
        newLesson.teacher = body.teacher;
        newLesson.group = body.group;
        newLesson.week = body.week;
        newLesson.weekDay = body.weekDay;
        newLesson.startTime = body.startTime;
        newLesson.endTime = body.endTime;
        // Check for timetravel
        if (newLesson.startTime > newLesson.endTime) {
            return "Time travel detected.";
        }

        // Save!
        try {
            await newLesson.save();
        } catch (error) {
            console.log(error.message);
            return "Post: Faliure";
        }
        set.status = 200;
        return "Post: Success";
    })
    .delete("/", async ({ body, set }) => {
        // Input from body
        let targetSubject = body.subject;
        let targetTeacher = body.teacher;
        let targetGroup = body.group;
        let targetWeek = body.week;
        let targetDay = body.weekDay;
        // Check existing
        set.status = 400;
        if (!(await Lesson.exists({ course: targetSubject }))) {
            return "Course not found";
        }
        if (!(await Lesson.exists({ teacher: targetTeacher }))) {
            return "Teacher not found";
        }
        if (!(await Lesson.exists({ group: targetGroup }))) {
            return "Group not found";
        }
        if (
            !(await Lesson.exists({
                week: targetWeek,
                weekDay: targetDay,
            }))
        ) {
            return "Week/Day not found";
        }
        // Delete!
        try {
            await Lesson.deleteOne({
                teacher: targetTeacher,
                course: targetSubject,
                group: targetGroup,
                week: targetWeek,
                weekDay: targetDay,
            });
        } catch (error) {
            console.log(error);
            return "Deletion: Faliure";
        }
        set.status = 200;
        return "Deletion: Success";
    })
    .patch("/", async ({ body, set }) => {
        // May god have mercy on my soul
        set.status = 400;
        if (
            !(await Lesson.exists({
                classroom: body.classroom,
                subject: body.subject,
                teacher: body.teacher,
                group: body.group,
                week: body.week,
                weekDay: body.weekDay,
            }))
        ) {
            return "Specified lesson doesn't exist.";
        }
        const target = await Lesson.findOne({
            classroom: body.classroom,
            subject: body.subject,
            teacher: body.teacher,
            group: body.group,
            week: body.week,
            weekDay: body.weekDay,
        });
        if (-1 != body.newStartTime) {
            if (0 > body.newStartTime || 143 < body.newStartTime) {
                return "Illegal start time.";
            }
            target.startTime = body.newStartTime;
        }
        if (-1 != body.newEndTime) {
            if (target.startTime > body.newEndTime) {
                return "Time travel detected.";
            }
            if (143 < body.newEndTime) {
                return "Illegal end time.";
            }
            target.endTime = body.newEndTime;
        }
        try {
            await target.save();
        } catch (error) {
            console.log(error);
            return "Patch: Faliure";
        }
        set.status = 200;
        return "Patch: Success";
    });