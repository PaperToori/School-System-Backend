import { Elysia } from 'elysia'
import { Classroom } from "../schemas/classroom.js";

export const classrooms_router = new Elysia({ prefix: '/classrooms' })
    .get("/", async () => {
        return await Classroom.find();
    })
    .post("/", async ({ body, set }) => {
        let newClassroom = new Classroom();
        newClassroom.name = JSON.parse(body).name;
        try {
            await newClassroom.save();
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
            return "No classroom was specified.";
        }
        if (!(await Classroom.exists({ name: target }))) {
            return "Classroom doesn't exist.";
        }
        try {
            await Classroom.deleteOne({ name: target });
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
        if (!(await Classroom.exists({ name: body.target }))) {
            return "Classroom doesnt exist.";
        }
        const target = await Classroom.findOne({ name: body.target });
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