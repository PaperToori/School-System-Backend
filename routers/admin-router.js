import { Elysia, error } from 'elysia'
import admin from 'firebase-admin';
import { UserDB } from "../schemas/users.js";
import { Teacher } from "../schemas/teacher.js";
import { Guardian } from "../schemas/guardian.js";
import { Student } from "../schemas/student.js";

let serviceAccount = require("../desk-17e4d-firebase-adminsdk-xgca0-0de33bf30a.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
export async function Authenticator(permission, id) {
    let permitted = false;
    let uid = null;
    try {
        await admin.auth().verifyIdToken(id)
            .then((decodedToken) => {
                uid = decodedToken.uid;
            })
    }
    catch (error) {
        console.log(`Error in Authenticator function.\nError message: "${error.message}"`);
        uid = null;
    }
    const user = await UserDB.findOne({ userID: uid });
    if (user != null) {
        if (user.permission >= permission) {
            permitted = true;
        }
    }
    console.log("Authenticator returning", permitted);
    return permitted;
}

// non typesafe way of doing guard
/*
app.guard(
    {
        //Beforehandle
        async beforeHandle({ set, headers }) {
            let id = headers.id;
            if (await Authenticator(1, id) == false) {
                console.log(id);
                console.log("NOT APPROVED!");
                return (set.status = 'Unauthorized')
            }
        }
        //Beforehandle
    },
    (app) =>
        app
            .get('/test/', ({ }) => {
                console.log("guard approved");
                return "guard approved";
            })
);
*/

export const admin_router = new Elysia({ prefix: '/admin' })
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
                .get('/test/', () => {
                    console.log("guard approved");
                    return JSON.stringify("guard approved");
                })
                .get("/user/", async () => {
                    return await UserDB.find();
                })
    )
    .guard(
        {
            async beforeHandle({ set, headers }) {
                console.log("receieved");
                let id = headers.id;
                if (await Authenticator(1, id) == false) {
                    console.log("NOT APPROVED!");
                    return (set.status = 'Unauthorized');
                }
            }
        },
        (App) =>
            App
                .patch("/profile/", async ({ set, body, headers }) => {
                    let id = headers.id;
                    let uid = null;
                    let parsedBody = JSON.parse(body);
                    try {
                        await admin.auth().verifyIdToken(id)
                            .then((decodedToken) => {
                                uid = decodedToken.uid;
                            })
                    }
                    catch (error) {
                        console.log(`Error in Authenticator function.\nError message: "${error.message}"`);
                    }
                    const user = await UserDB.findOne({ userID: uid });
                    if (user != null) {
                        if (user.dataType.length === 0) {
                            return "user not linked to any profile"
                        }
                        let oldProfile;
                        let profileID = user.dataType[parsedBody.profileNumber].split(":");
                        profileID = profileID[1];
                        if (user.dataType[parsedBody.profileNumber][0] == "S") {
                            oldProfile = await Student.findOne({ _id: profileID });
                            oldProfile.phoneNumber = parsedBody.profile.phoneNumber;
                            oldProfile.email = parsedBody.profile.email;
                        }
                        else if (user.dataType[parsedBody.profileNumber][0] == "G") {
                            oldProfile = await Guardian.findOne({ _id: profileID });
                            oldProfile.phoneNumber = parsedBody.profile.phoneNumber;
                            oldProfile.email = parsedBody.profile.email;
                            oldProfile.name = parsedBody.profile.name;
                            oldProfile.socialSecurityNumber = parsedBody.profile.socialSecurityNumber;
                            oldProfile.adress = parsedBody.profile.adress;
                            oldProfile.zip = parsedBody.profile.zip;
                            //Should add the ability to change values for their kid
                        }
                        else if (user.dataType[parsedBody.profileNumber][0] == "T") {
                            oldProfile = await Teacher.findOne({ _id: profileID });
                            oldProfile.phoneNumber = parsedBody.profile.phoneNumber;
                            oldProfile.gmail = parsedBody.profile.email;
                        }
                        else {
                            return JSON.stringify("Not logged in");
                        }
                        try {
                            await oldProfile.save();
                            set.status = 200;
                            return "Post: Success";
                        } catch (error) {
                            console.log(error.message);
                            return "Post: Faliure";
                        }
                    }
                })
    )
    .get("/profile/", async ({ set, headers }) => {
        let id = headers.id;

        let uid = null;
        try {
            await admin.auth().verifyIdToken(id)
                .then((decodedToken) => {
                    uid = decodedToken.uid;
                })
        }
        catch (error) {
            console.log(`Error in Authenticator function.\nError message: "${error.message}"`);
        }

        const user = await UserDB.findOne({ userID: uid });
        if (user != null) {
            let response = {
                profile: [],
                profileType: []
            };
            if (user.dataType.length === 0) {
                return "user not linked to any profile"
            }
            for (let i = 0; i < user.dataType.length; i++) {
                let profileID = user.dataType[i].split(":");
                profileID = profileID[1];
                if (user.dataType[i][0] == "S") {
                    response.profile[i] = await Student.findOne({ _id: profileID });
                    response.profileType[i] = "Elev";
                }
                else if (user.dataType[i][0] == "G") {
                    response.profile[i] = await Guardian.findOne({ _id: profileID });
                    response.profileType[i] = "Vårdnashavare";
                }
                else if (user.dataType[i][0] == "T") {
                    response.profile[i] = await Teacher.findOne({ _id: profileID });
                    response.profileType[i] = "Lärare";
                }
                else {
                    set.status = "Internal Server Error";
                    return JSON.stringify("Not logged in")
                }
            }

            return response;
        }
        else {
            return JSON.stringify("Not logged in");
        }
    })
    .get("/", async () => {
        return "not protected route";
    });