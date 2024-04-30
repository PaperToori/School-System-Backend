import { Elysia } from 'elysia'
import { Teacher } from "../schemas/teacher.js";

export const teacher_router = new Elysia({ prefix: '/teachers' })
    .get("/", async () => {
        return await Teacher.find();
    })
    .post("/", async ({ body, set }) => {
        //
        let parsedBody = JSON.parse(body);
        // Input from body
        let newTeacher = new Teacher();
        newTeacher.name = parsedBody.name;
        newTeacher.gmail = parsedBody.gmail;
        newTeacher.phoneNumber = parsedBody.phoneNumber;
        // Save!
        try {
            await newTeacher.save();
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
            return "No teacher was specified.";
        }
        if (!(await Teacher.exists({ name: target }))) {
            return "Teacher doesn't exist.";
        }
        try {
            await Teacher.deleteOne({ name: target });
        } catch (error) {
            console.log(error);
            return "Deletion: Faliure";
        }
        set.status = 200;
        return "Deletion: Success";
    })
    .patch("/", async ({ body, set }) => {
        set.status = 400;
        if ("" == body.target) {
            return "Lacking target";
        }
        if (!(await Teacher.exists({ name: body.target }))) {
            return "Teacher doesnt exist.";
        }
        const target = await Teacher.findOne({ name: body.target });
        if ("" != body.newName) {
            if (await Teacher.exists({ name: body.newName })) {
                return "Teacher with suggested name already exists.";
            }
            target.name = body.newName;
        }
        if ("" != body.newGmail) {
            target.gmail = body.newGmail;
        }
        if ("" != body.newPhoneNumber) {
            target.phoneNumber = body.newPhoneNumber;
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