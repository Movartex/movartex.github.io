import { DB } from './db.js';
const [tables, schemas] = await Promise.all([
    fetch('/tables.json').then(response => response.json()),
    fetch('/schemas.json').then(response => response.json()),
]);
export const db = new DB();
db.tables = tables;
db.schemas = schemas;

export function coursesOfTeacher(TeacherID) {
    const entries = db.select('CourseTeacher', courseTeacher => courseTeacher.TeacherID === TeacherID);
    return db.select('Course', course => entries.some(entry => entry.CourseID === course.CourseID));
}

export function teachersOfCourse(CourseID) {
    const entries = db.select('CourseTeacher', courseTeacher => courseTeacher.CourseID === CourseID);
    return db.select('Teacher', teacher => entries.some(entry => entry.TeacherID === teacher.TeacherID));
}
