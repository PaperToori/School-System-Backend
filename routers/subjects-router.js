import { Elysia } from 'elysia'
import { Subject } from "../schemas/subject.js";

export const subjects_router = new Elysia({ prefix: '/subjects' })
    .get("/", async () => {
        return await Subject.find();
    })
    .post("/", async ({ body, set }) => {
        let newSubject = new Subject();
        newSubject.name = JSON.parse(body).name;
        try {
            await newSubject.save();
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
            return "No subject was specified.";
        }
        if (!(await Subject.exists({ name: target }))) {
            return "Subject does not exist.";
        }
        try {
            await Subject.deleteOne({ name: target });
        } catch (error) {
            console.log(error);
            return "Deletion: Faliure";
        }
        set.status = 200;
        return "Deletion: Success";
    })
    .patch("/", async () => {
        return "not implemented yet";
    });