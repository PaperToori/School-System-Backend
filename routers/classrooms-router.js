import { Elysia } from 'elysia'
import { Classroom } from "../schemas/classroom.js";
import { Authenticator } from './admin-router.js';


export const classrooms_router = new Elysia({ prefix: '/classrooms' })
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
                    return await Classroom.find();
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
                    let target = JSON.parse(body).name;
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
                    let parsedBody = JSON.parse(body);
                    set.status = 400;
                    if ("" == parsedBody.target || "" == parsedBody.newName) {
                        return "Lacking input";
                    }
                    if (!(await Classroom.exists({ name: parsedBody.target }))) {
                        return "Classroom doesnt exist.";
                    }
                    const target = await Classroom.findOne({ name: parsedBody.target });
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