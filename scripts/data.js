import { DB } from './db.js';
const [tables, schemas] = await Promise.all([
    fetch('/tables.json').then(response => response.json()),
    fetch('/schemas.json').then(response => response.json()),
]);
export const db = new DB();
db.tables = tables;
db.schemas = schemas;

export function coursesOfTeacher(teacher) {
    return db.select('Course', course =>
        db.find('CourseTeacher', ({ CourseID, TeacherID }) =>
            CourseID === course.CourseID && TeacherID === teacher.TeacherID));
}

export function coursesOfCategory(courseCategory) {
    return db.select('Course', course => course.CourseCategoryID === courseCategory.CourseCategoryID);
}

export function teachersOfCategory(courseCategory) {
    const courses = coursesOfCategory(courseCategory);
    return db.select('Teacher', teacher =>
        db.find('CourseTeacher', ({ CourseID, TeacherID }) =>
            courses.find(course => course.CourseID === CourseID) && TeacherID === teacher.TeacherID));
}
