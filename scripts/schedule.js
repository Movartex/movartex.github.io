import { template } from './template.js';

export function timeToNumber(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function numberToTime(number) {
    const [hours, minutes] = [Math.floor(number / 60), number % 60];
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function getGridRow(from, to, timeStart, timeStep, headerOffset = 2) {
    const start = ((from - timeStart) / timeStep);
    const end = ((to - timeStart) / timeStep);
    return `${start + headerOffset} / ${end + headerOffset}`;
}

export function createSchedule(items = []) {
    function createHeaderDay(it, sl, en) {
        return template(`
        <div class="schedule-header">
            <span lang="it">${it}</span>
            <span lang="sl">${sl}</span>
            <span lang="en">${en}</span>
        </div>
        `);
    }

    const schedule = template(`
    <div class="schedule-grid">
        <div class="schedule-header sticky-left">
            <span lang="it">Ora</span>
            <span lang="sl">Ura</span>
            <span lang="en">Time</span>
        </div>
    </div>
    `);

    const days = [
        ['Lunedì', 'Ponedeljek', 'Monday'],
        ['Martedì', 'Torek', 'Tuesday'],
        ['Mercoledì', 'Sreda', 'Wednesday'],
        ['Giovedì', 'Četrtek', 'Thursday'],
        ['Venerdì', 'Petek', 'Friday'],
        ['Sabato', 'Sobota', 'Saturday'],
        ['Domenica', 'Nedelja', 'Sunday'],
    ];
    const grid = schedule.querySelector('.schedule-grid');
    for (const day of days) {
        grid.appendChild(createHeaderDay(...day));
    }

    const timeStart = timeToNumber('15:00');
    const timeEnd = timeToNumber('23:00');
    const timeStep = timeToNumber('01:00');
    const gridStep = timeToNumber('00:15');

    for (let time = timeStart; time < timeEnd; time += timeStep) {
        const gridRow = getGridRow(time, time + timeStep, timeStart, gridStep);
        const timeSlot = template(`
            <div class="time-slot sticky-left" style="grid-row: ${gridRow}; grid-column: 1;">${numberToTime(time)}</div>
        `);
        grid.appendChild(timeSlot);
    }

    for (const item of items) {
        const start = timeToNumber(item.start);
        const end = timeToNumber(item.end);
        const gridRow = getGridRow(start, end, timeStart, gridStep);
        const gridColumn = item.day + 1;

        const element = item.element.firstElementChild;

        element.style.gridRow = gridRow;
        element.style.gridColumn = gridColumn;

        grid.appendChild(item.element);
    }

    return schedule;
}
