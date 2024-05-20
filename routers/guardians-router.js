import { Elysia } from 'elysia'
import { Student } from "../schemas/student.js";
import { Guardian } from "../schemas/guardian.js";
import { UserDB } from "../schemas/users.js";
import { Authenticator } from './admin-router.js';
import { Group } from "../schemas/group.js";
import admin from 'firebase-admin';

export const guardians_router = new Elysia({ prefix: '/guardians' })
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
                .get("/", async ({ headers }) => {
                    return await Guardian.find({});
                })
                .get("/exists", async ({ headers }) => {
                    let response = "false";
                    let guardianid = JSON.stringify(headers.guardian);
                    console.log(guardianid);
                    const guardian = await Guardian.findOne({ socialSecurityNumber: headers.guardian })
                    console.log(guardian);
                    if (guardian != null) {
                        response = "true";
                    }
                    console.log(response);
                    return JSON.stringify(response);
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
                console.log("APPROVED!");
            }
        },
        (App) =>
            App
                .post("/", async ({ body, set }) => {
                    set.status = 400;
                    let parsedBody = JSON.parse(body);
                    // Fill in from body
                    let newGuardian = new Guardian();
                    newGuardian.name = parsedBody.name;
                    newGuardian.email = parsedBody.email;
                    newGuardian.phoneNumber = parsedBody.phoneNumber;
                    newGuardian.socialSecurityNumber = parsedBody.socialSecurityNumber;
                    newGuardian.adress = parsedBody.adress;
                    newGuardian.zip = parsedBody.zip;
                    newGuardian.city = parsedBody.city;
                    const child = await Student.findOne({ socialSecurityNumber: parsedBody.child });
                    if (child != null) {
                        newGuardian.guardian = child._id;
                        if (child.socialSecurityNumber == parsedBody.socialSecurityNumber) {
                            newGuardian.user = child.user;
                        }
                    }
                    if (newGuardian.user != undefined) {
                        const user = UserDB.find({ _id: newGuardian.user });
                        if (user != null) {
                            if (user.permission < 1) {
                                user.permission = 1;
                            }
                            user.dataType.push("G:" + newGuardian._id);
                            try {
                                await user.save();
                            } catch (error) {
                                console.log(error.message);
                                return "error changing user permission level";
                            }
                        }
                    }
                    // the guardian doesnt have a user account so we create one
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
                            newUser.dataType.push("G:" + newGuardian._id);
                            await newUser.save().then(() => {
                                newGuardian.user = userRecord.uid;
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
                        await newGuardian.save();
                        set.status = 200;
                        return "Post: Success";
                    } catch (error) {
                        console.log(error.message);
                        return "Post: Faliure";
                    }
                })
                .patch("/", async ({ set, body }) => {
                    console.log("attempting to patch");
                    set.status = 400;

                    let parsedBody = JSON.parse(body);
                    let guardian = await Guardian.findOne({ socialSecurityNumber: parsedBody.id });
                    const child = await Student.findOne({ socialSecurityNumber: parsedBody.childID });
                    console.log(child);
                    if (child != null) {
                        guardian.child = child._id;
                        if (child.socialSecurityNumber == parsedBody.socialSecurityNumber) {
                            guard.user = child.user;
                        }
                    }
                    // Save!
                    try {
                        await guardian.save();
                        set.status = 200;
                        return "Post: Success";
                    } catch (error) {
                        console.log(error.message);
                        return "Post: Faliure";
                    }
                })
    );