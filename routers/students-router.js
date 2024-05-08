import { Elysia } from 'elysia'
import { Student } from "../schemas/student.js";
import { Guardian } from "../schemas/guardian.js";
import { UserDB } from "../schemas/users.js";
import { Authenticator } from './admin-router.js';
import admin from 'firebase-admin';

export const students_router = new Elysia({ prefix: '/students' })
    .guard(
        {
            async beforeHandle({ set, headers }) {
                let id = headers.id;
                if (await Authenticator(2, id) == false) {
                    console.log("NOT APPROVED!");
                    return (set.status = 'Unauthorized');
                }
                console.log("APPROVED");
            }
        },
        (App) =>
            App
                .get("/", async () => {
                    return await Student.find({});
                }))
    .guard(
        {
            async beforeHandle({ set, headers }) {
                let id = headers.id;
                if (await Authenticator(3, id) == false) {
                    console.log("NOT APPROVED!");
                    return (set.status = 'Unauthorized');
                }
                console.log("APPROVED");
            }
        },
        (App) =>
            App
                .post("/", async ({ body, set }) => {
                    set.status = 400;
                    let parsedBody = JSON.parse(body);
                    // Fill in from body
                    let newStudent = new Student();
                    newStudent.name = parsedBody.name;
                    newStudent.course = parsedBody.course;
                    newStudent.email = parsedBody.email;
                    newStudent.phoneNumber = parsedBody.phoneNumber;
                    //Fill out tags not yet implemented
                    newStudent.socialSecurityNumber = parsedBody.socialSecurityNumber;
                    newStudent.adress = parsedBody.adress;
                    newStudent.zip = parsedBody.zip;
                    newStudent.city = parsedBody.city;
                    const guardian = await Guardian.findOne({ name: parsedBody.guardian });
                    if (guardian != null) {
                        newStudent.guardian = guardian._id;
                        if (guardian.socialSecurityNumber == parsedBody.socialSecurityNumber) {
                            newStudent.user = guardian.user;
                        }
                    }
                    else {
                        //guardian does not exsit yet, we should prompt user to fill out contact information for guardian
                        //set.status = 501;
                        //return("this student doesnt have a guradian which needs to be implemented");
                    }
                    // if the student for some reason already has an account registered as guardian then the guardian and the student are assigned to the same user
                    if (newStudent.user != undefined) {
                        const user = UserDB.find({ _id: newStudent.user });
                        if (user != null && user.permission < 1) {
                            user.permission = 1;
                            user.dataType.push("S:" + newStudent._id);
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
                            newUser.permission = 1;
                            newUser.dataType.push("S:" + newStudent._id);
                            await newUser.save().then(() => {
                                newStudent.user = userRecord.uid;
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
                        await newStudent.save();
                        set.status = 200;
                        return "Post: Success";
                    } catch (error) {
                        console.log(error.message);
                        return "Post: Faliure";
                    }

                })
                .delete("/", async ({ body, set }) => {
                    let target = JSON.parse(body).name;
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
                .patch("/", async ({ body, set }) => { // Never used, never fixed
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
                        target.email = body.newGmail;
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