import { Elysia } from 'elysia'
import { Teacher } from "../schemas/teacher.js";
import { Course } from '../schemas/course.js';
import { Authenticator } from './admin-router.js';
import { Group } from "../schemas/group.js";
import { Subject } from "../schemas/subject.js";


export const course_router = new Elysia({ prefix: '/course' })
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
                    return await Course.find();
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
                .post("/", async ({ set, body }) => {
                    set.status = 500;
                    let parsedBody = JSON.parse(body);
                    let course = new Course();
                    course.name = parsedBody.name;
                    const subject = await Subject.findOne({ name: parsedBody.subject });
                    if (subject != null) {
                        course.subject = subject.name;
                    }
                    else {
                        set.status = "Bad Request";
                        return "subject doesn't exsist";
                    }
                    const group = await Group.findOne({ name: parsedBody.group });
                    if (group != null) {
                        course.group = group.name;
                    }
                    else {
                        set.status = "Bad Request";
                        return "Course doesn't exsist";
                    }
                    let teacher = await Teacher.findOne({ _id: parsedBody.teacher });
                    if (teacher != null) {
                        course.teacher = teacher.id;
                        teacher.course.push(course.name);
                        try {
                            await teacher.save();
                        } catch (error) {
                            console.log("teacher save: ", error.message);
                            return "Post: Faliure";
                        }
                    }
                    else {
                        set.status = "Bad Request";
                        return "teacher doesn't exsist";
                    }
                    // Save!
                    try {
                        console.log(`saving course: ${course}`);
                        await course.save();
                        set.status = 200;
                        return "Post: Success";
                    } catch (error) {
                        console.log("course save: ", error.message);
                        return "Post: Faliure";
                    }
                })
                .delete("/", async ({ set, body }) => {
                    let target = JSON.parse(body).name;
                    set.status = 500;
                    if (null == target) {
                        return "No course was specified.";
                    }
                    console.log(target);
                    if (!(await Course.exists({ name: target }))) {
                        return "Course doesn't exist.";
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
    )
    ;