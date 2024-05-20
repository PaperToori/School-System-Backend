import { Elysia } from 'elysia'
import { Teacher } from "../schemas/teacher.js";
import { UserDB } from '../schemas/users.js';
import { Guardian } from '../schemas/guardian.js';
import { Authenticator } from './admin-router.js';
import admin from 'firebase-admin';

export const teacher_router = new Elysia({ prefix: '/teachers' })
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
                    return await Teacher.find();
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
                    set.status = 400;
                    let parsedBody = JSON.parse(body);
                    // Fill in from body
                    let teacher = new Teacher();
                    teacher.name = parsedBody.name;
                    teacher.email = parsedBody.email;
                    teacher.phoneNumber = parsedBody.phoneNumber;
                    teacher.socialSecurityNumber = parsedBody.socialSecurityNumber;
                    teacher.adress = parsedBody.adress;
                    teacher.zip = parsedBody.zip;
                    teacher.city = parsedBody.city;
                    // if the teacher for some reason already has an account registered as guardian then the guardian and the teacher are assigned to the same user
                    const guardian = await Guardian.findOne({ socialSecurityNumber: teacher.socialSecurityNumber });
                    if (guardian != null) {
                        teacher.user = guardian.user;
                        let user = UserDB.find({ _id: teacher.user });
                        if (user != null) {
                            if (user.permission < 2) {
                                user.permission = 2;
                            }
                            user.dataType.push("T:" + teacher._id);
                            try {
                                await user.save();
                            } catch (error) {
                                console.log(error.message);
                                return "error changing user permission level";
                            }
                        }

                    }
                    // the student doesnt have a user account so we create one
                    else {
                        console.log("no user account found");
                        await admin.auth().createUser({
                            email: parsedBody.email,
                            password: parsedBody.tempPassword,
                            displayName: parsedBody.name,
                        }).then(async (userRecord) => {
                            // See the UserRecord reference doc for the contents of userRecord.
                            console.log('Successfully created new user:', userRecord.uid);
                            let newUser = new UserDB();
                            newUser.userID = userRecord.uid;
                            newUser.permission = 2;
                            newUser.dataType.push("T:" + teacher._id);
                            await newUser.save().then(() => {
                                teacher.user = userRecord.uid;
                            }).catch((error) => {
                                console.log(error.message);
                                set.status = 400;
                                return `Error saving new user: ${error}`;
                            });
                        }).catch((error) => {
                            console.log('Error creating new user:', error);
                            return `Error creating new user: ${error}`;
                        });
                    }
                    // Save!
                    try {
                        await teacher.save();
                        set.status = 200;
                        return "Post: Success";
                    } catch (error) {
                        console.log(error.message);
                        return "Post: Faliure";
                    }
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
                })
    );