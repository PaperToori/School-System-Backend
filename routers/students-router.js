import { Elysia } from 'elysia'
import { Student } from "../schemas/student.js";

export const students_router = new Elysia({ prefix: '/students' })
    .get("/", async () => {
        return await Student.find({});
    })
    .post("/", async ({ body, set }) => {
        set.status = 400;
        let parsedBody = JSON.parse(body);
        // Fill in from body
        let newStudent = new Student();
        newStudent.name = parsedBody.name;
        newStudent.course = parsedBody.course;
        newStudent.gmail = parsedBody.gmail;
        newStudent.phoneNumber = parsedBody.phoneNumber;
        // Save!
        try {
            await newStudent.save();
        } catch (error) {
            console.log(error.message);
            return "Post: Faliure";
        }
        set.status = 200;
        return "Post: Success";
    })
    .delete("/", async ({ body, set }) => {
        let target = body.name;
        set.status = 400;
        if ("" == target) {
            return "No student was specified.";
        }
        if (!(await Student.exists({ name: target }))) {
            return "Student doesn't exist.";
        }
        try {
            await Student.deleteOne({ name: target });
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
        if (!(await Student.exists({ name: body.target }))) {
            return "Student doesnt exist.";
        }
        const target = await Student.findOne({ name: body.target });
        if ("" != body.newName) {
            if (await Student.exists({ name: body.newName })) {
                return "Student with suggested name already exists.";
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