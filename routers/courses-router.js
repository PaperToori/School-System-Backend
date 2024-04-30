import { Elysia } from 'elysia'
import { Course } from "../schemas/course.js";

export const courses_router = new Elysia({ prefix: '/courses' })
    .get("/", async () => {
        return await Course.find();
    })
    .post("/", async ({ body, set }) => {
        let newCourse = new Course();
        newCourse.name = JSON.parse(body).name;
        try {
            await newCourse.save();
        } catch (error) {
            console.log(error.message);
            set.status = 400;
            return "Post: Faliure";
        }
        return "Post: Success";
    })
    .delete("/", async ({ body, set }) => {
        let target = body.name;
        set.status = 400;
        if ("" == target) {
            return "No course was specified.";
        }
        if (!(await Course.exists({ name: target }))) {
            return "Course does not exist.";
        }
        try {
            await Course.deleteOne({ name: target });
        } catch (error) {
            console.log(error);
            return "Deletion: Faliure";
        }
        set.status = 200;
        return "Deletion: Success";
    })
    .patch("/", async ({ body, set }) => {
        set.status = 400;
        if ("" == body.target || "" == body.newName) {
            return "Lacking input";
        }
        if (!(await Course.exists({ name: body.target }))) {
            return "Course doesn't exist.";
        }
        const target = await Course.findOne({ name: body.target });
        target.name = body.newName;
        try {
            await target.save();
        } catch (error) {
            console.log(error);
            return "Patch: Faliure";
        }
        set.status = 200;
        return "Patch: Success";
    });