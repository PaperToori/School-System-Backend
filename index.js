import mongoose from "mongoose";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
//Schemas
import { UserDB } from "./schemas/users.js";
import { Classroom } from "./schemas/classroom.js";
import { Course } from "./schemas/course.js";
import { Group } from "./schemas/group.js";
import { Lesson } from "./schemas/lesson.js";
import { Student } from "./schemas/student.js";
import { Subject } from "./schemas/subject.js";
import { Teacher } from "./schemas/teacher.js";
import { Guardian } from "./schemas/guardian.js";
//import { LessonTemplate } from "./schemas/lessonTemplate.js"; //not in use
//import { LessonTime } from "./schemas/lessonTime.js"; //not in use
//routers
import { test_router } from "./routers/test-router.js";
import { auth_router } from "./routers/auth-router.js";
import { classrooms_router } from "./routers/classrooms-router.js";
import { courses_router } from "./routers/courses-router.js";
import { groups_router } from "./routers/groups-router.js";
import { lessons_router } from "./routers/lessons-router.js";
import { students_router } from "./routers/students-router.js";
import { subjects_router } from "./routers/subjects-router.js";
import { teacher_router } from "./routers/teachers-router.js";

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});
const Tag = mongoose.model('Tag', TagSchema);

// ---------------------------------------------------------
// Server --------------------------------------------------

const dbURI = `mongodb+srv://garrattkarl:${process.env.DB_PASSWORD}@cluster0.ar0kjrf.mongodb.net/?retryWrites=true&w=majority`;

try {
    await mongoose.connect(dbURI);
    console.log("Connected to database ...");
} catch (error) {
    console.log(`Could not connect to database: ${error.message}`);
}


const app = new Elysia();

app.use(cors());

app.use(test_router);
app.use(auth_router);
app.use(classrooms_router);
app.use(courses_router);
app.use(groups_router);
app.use(lessons_router);
app.use(students_router);
app.use(subjects_router);
app.use(teacher_router);


// ---------------------------------------------------------
// GET REQUESTS --------------------------------------------

app.get('/tags/', async () => {
    return await Tag.find();
});

// ---------------------------------------------------------
// POST REQUESTS -------------------------------------------

app.post('/tags/', async ({ body, set }) => {
    let newTag = new Tag();
    newTag.name = JSON.parse(body).name;
    try { await newTag.save(); }
    catch (error) { console.log(error.message); set.status = 400; return "Post: Faliure"; }
    return "Post: Success";
});

// ---------------------------------------------------------
// DELETE REQUESTS -----------------------------------------



// ---------------------------------------------------------
// EDIT REQUESTS -------------------------------------------

app.patch("/groups/", async ({ body, set }) => { }); // Don't even bother

// ---------------------------------------------------------

// ---------------------------------------------------------
// GROUP REQUESTS -------------------------------------------

// Not sure if I'll ever end up filling this section...

// ---------------------------------------------------------

app.get("/", () => {
    let message = "";
    message += "Functions:\n";
    message += "\ng/p/d\t/classrooms";
    message += "\ng/p/d\t/tags";
    message += "\ng/p/d\t/groups";
    message += "\ng/p/d\t/lessons";
    message += "\ng/p/d\t/students";
    message += "\ng/p/d\t/teachers";
    return message;
});

app.delete("/burnitall", async () => {
    await Classroom.deleteMany();
    await Tag.deleteMany();
    await Group.deleteMany();
    await Lesson.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    let message =
        "The records: all burned.\nYou must start anew now.\nBut it will all be worth it in the end, right?\n\n...right?";
    return message;
});


// Put this on bottom
app.listen(8080, () =>
    console.log("Webserver up and running at http://localhost:8080\n")
);
