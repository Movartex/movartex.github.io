import { template } from './template.js';
import * as col from '/scripts/color.js';

export async function createCourseCard(course) {
    const url = new URL(course.URL, window.location.origin);
    const icon = new URL(course.Icon, window.location.origin);
    const short = new URL(course.Short, window.location.origin);

    const card = template(`
        <div class="card center-text">
            <img class="icon-image" src="${icon}">
            <h3></h3>
            <p></p>
            <a lang="it" class="learn-more" href="${url}">Scopri di più<i class="fas fa-arrow-right"></i></a>
            <a lang="sl" class="learn-more" href="${url}">Preberi več<i class="fas fa-arrow-right"></i></a>
            <a lang="en" class="learn-more" href="${url}">Learn more<i class="fas fa-arrow-right"></i></a>
        </div>
    `);

    await fetch(short).then(response => response.text()).then(shortHTML => {
       const short = template(shortHTML);
       card.querySelector('h3').replaceChildren(short.querySelector('.course-title'));
       card.querySelector('p').replaceChildren(short.querySelector('.course-short'));
    });

    return card;
}

export async function createCourseCategoryCard(courseCategory) {
    const url = new URL(courseCategory.URL, window.location.origin);
    const icon = new URL(courseCategory.Icon, window.location.origin);
    const short = new URL(courseCategory.Short, window.location.origin);

    const card = template(`
        <div class="card center-text">
            <img class="icon-image" src="${icon}">
            <h3></h3>
            <p></p>
            <a lang="it" class="learn-more" href="${url}">Scopri di più<i class="fas fa-arrow-right"></i></a>
            <a lang="sl" class="learn-more" href="${url}">Preberi več<i class="fas fa-arrow-right"></i></a>
            <a lang="en" class="learn-more" href="${url}">Learn more<i class="fas fa-arrow-right"></i></a>
        </div>
    `);

    await fetch(short).then(response => response.text()).then(shortHTML => {
       const short = template(shortHTML);
       card.querySelector('h3').replaceChildren(short.querySelector('.course-title'));
       card.querySelector('p').replaceChildren(short.querySelector('.course-short'));
    });

    return card;
}

export async function createTeacherCard(teacher) {
    const url = new URL(teacher.URL, window.location.origin);
    const icon = new URL(teacher.Icon, window.location.origin);
    const short = new URL(teacher.Short, window.location.origin);

    const card = template(`
        <div class="card center-text">
            <img class="icon-image" src="${icon}">
            <h3></h3>
            <p></p>
            <a lang="it" class="learn-more" href="${url}">Scopri di più<i class="fas fa-arrow-right"></i></a>
            <a lang="sl" class="learn-more" href="${url}">Preberi več<i class="fas fa-arrow-right"></i></a>
            <a lang="en" class="learn-more" href="${url}">Learn more<i class="fas fa-arrow-right"></i></a>
        </div>
    `);

    await fetch(short).then(response => response.text()).then(shortHTML => {
       const short = template(shortHTML);
       card.querySelector('h3').replaceChildren(short.querySelector('.teacher-title'));
       card.querySelector('p').replaceChildren(short.querySelector('.teacher-short'));
    });

    return card;
}

export async function createNewsCard(news) {
    const url = new URL(news.URL, window.location.origin);
    const short = new URL(news.Short, window.location.origin);

    const card = template(`
        <div class="card">
            <div class="news-date">${news.Date}</div>
            <h3></h3>
            <p></p>
            <a lang="it" class="learn-more" href="${url}">Scopri di più<i class="fas fa-arrow-right"></i></a>
            <a lang="sl" class="learn-more" href="${url}">Preberi več<i class="fas fa-arrow-right"></i></a>
            <a lang="en" class="learn-more" href="${url}">Learn more<i class="fas fa-arrow-right"></i></a>
        </div>
    `);

    await fetch(short).then(response => response.text()).then(shortHTML => {
       const short = template(shortHTML);
       card.querySelector('h3').replaceChildren(short.querySelector('.news-title'));
       card.querySelector('p').replaceChildren(short.querySelector('.news-short'));
    });

    return card;
}

export async function createScheduleItem(scheduleItem, course, courseCategory, location) {
    const url = new URL(courseCategory.URL, window.location.origin);
    const short = new URL(course.Short, window.location.origin);

    // random color for category
    const golden = (1 + Math.sqrt(5)) / 2;
    const hue = golden * courseCategory.CourseCategoryID;
    const oklch = [0.6, 0.1, hue];
    const oklab = col.oklchToOklab(oklch);
    const srgb = col.oklabToSrgb(oklab);
    const hex = col.srgbToHex(srgb);

    const card = template(`
        <a href="${url}" class="schedule-item" style="background-color: ${hex};">
            <div class="schedule-item-name"></div>
            <div class="schedule-item-time">${scheduleItem.StartTime} - ${scheduleItem.EndTime}</div>
            <div class="schedule-item-location"></div>
        </a>
    `);

    await fetch(short).then(response => response.text()).then(shortHTML => {
       const short = template(shortHTML);
       card.querySelector('.schedule-item-name').replaceChildren(short.querySelector('.course-title'));
    });

    if (location && location !== window.location) { // because global scope gets window -_- ...
        const url = new URL(location.Short, window.location.origin);
        await fetch(url).then(response => response.text()).then(shortHTML => {
            const short = template(shortHTML);
            card.querySelector('.schedule-item-location').replaceChildren(short.querySelector('.location-title'));
        });
    }

    return card;
}
