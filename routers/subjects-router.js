import { Elysia } from 'elysia'
import { Subject } from "../schemas/subject.js";
import { Authenticator } from './admin-router.js';

export const subjects_router = new Elysia({ prefix: '/subjects' })
    .guard(
        {
            async beforeHandle({ set, headers }) {
                let id = headers.id;
                if (await Authenticator(2, id) == false) {
                    console.log("NOT APPROVED!");
                    return (set.status = 'Unauthorized');
                }
            }
        },
        (App) =>
            App
                .get("/", async () => {
                    return await Subject.find();
                })
    )
    .guard(
        {
            async beforeHandle({ set, headers }) {
                let id = headers.id;
                if (await Authenticator(3, id) == false) {
                    console.log("NOT APPROVED!");
                    return (set.status = 'Unauthorized');
                }
            }
        },
        (App) =>
            App
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
                    let target = JSON.parse(body).name;
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
                .patch("/", async ({ body, set }) => {
                    let parsedBody = JSON.parse(body);
                    set.status = 400;
                    if ("" == parsedBody.target || "" == parsedBody.newName) {
                        return "Lacking input";
                    }
                    if (!(await Subject.exists({ name: parsedBody.target }))) {
                        return "Classroom doesnt exist.";
                    }
                    const target = await Subject.findOne({ name: parsedBody.target });
                    target.name = parsedBody.newName;
                    try {
                        await target.save();
                    } catch (error) {
                        console.log(error);
                        return "Patch: Faliure";
                    }
                    set.status = 200;
                    return "Patch: Success";
                })
    );