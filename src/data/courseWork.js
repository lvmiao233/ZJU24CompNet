export const LabDeadlineData = [
    { name: 'Lab 1', start: '2024-09-10 13:25:00', end: '2024-09-24 23:59:59', },
    { name: 'Lab 2', start: '2024-09-24 13:25:00', end: '2024-10-15 23:59:59', },
    { name: 'Lab 3', start: '2024-10-15 13:25:00', end: '2024-10-29 23:59:59', },
    { name: 'Lab 4', start: '2024-10-29 13:25:00', end: '2024-11-12 23:59:59', },
    { name: 'Lab 5', start: '2024-11-12 13:25:00', end: '2024-11-26 23:59:59', },
    { name: 'Lab 6', start: '2024-11-26 13:25:00', end: '2024-12-10 23:59:59', },
    { name: 'Lab 7', start: '2024-09-21 13:25:00', end: '2024-12-29 23:59:59', },
    { name: 'Lab 8', start: '2024-09-21 13:25:00', end: '2024-12-29 23:59:59', },
];

const courseWorkData = {
    items: [
        { key: 0, name: '课程作业', cnt: 6, ratio: '15%' },
        { key: 1, name: '课堂测验', cnt: 8, ratio: '10%' },
        { key: 2, name: '课程实验', cnt: 8, ratio: '25%' },
        { key: 3, name: '期末考试', cnt: 1, ratio: '50%' },
    ],
    detail: [
        [
            { name: 'Homework 1', start: '2024-09-10 12:00:00', end: '2024-09-20 23:59:00', },
            { name: 'Homework 2', start: '2024-09-21 12:00:00', end: '2024-10-07 23:59:00', },
            { name: 'Homework 3', start: '2024-10-08 12:00:00', end: '2024-10-23 23:59:00', },
            { name: 'Homework 4', start: '2024-10-22 12:00:00', end: '2024-11-04 23:59:00', },
            { name: 'Homework 5', start: '2024-11-05 12:00:00', end: '2024-11-18 23:59:00', },
            { name: 'Homework 6', start: '2024-11-19 12:00:00', end: '2024-12-02 23:59:00', }
        ], [
            { name: 'Quiz 1', start: '2024-12-10 14:40:00', end: '2024-12-10 15:00:00', },
            { name: 'Quiz 2', start: '2024-12-10 15:00:00', end: '2024-12-10 15:20:00', },
            { name: 'Quiz 3', start: '2024-12-17 14:05:00', end: '2024-12-17 14:25:00', },
            { name: 'Quiz 4', start: '2024-12-17 14:25:00', end: '2024-12-17 14:45:00', },
            { name: 'Quiz 5', start: '2024-12-17 14:45:00', end: '2024-12-17 15:05:00', },
            { name: 'Quiz 6', start: '2024-12-24 14:10:00', end: '2024-12-24 14:20:00', },
            { name: 'Quiz 7', start: '2024-12-24 14:20:00', end: '2024-12-24 14:40:00', },
            { name: 'Quiz 8', start: '2024-12-24 14:40:00', end: '2024-12-24 15:00:00', }
        ], LabDeadlineData, [
            { name: '期末考试', start: '2025-01-11 10:30:00', end: '2025-01-11 12:30:00', },
        ]
    ]
}
export default courseWorkData;
