export const STAGES = [
    { name: '집중', minutes: 25 },
    { name: '짧은 휴식', minutes: 5 },
    { name: '집중', minutes: 25 },
    { name: '짧은 휴식', minutes: 5 },
    { name: '집중', minutes: 25 },
    { name: '짧은 휴식', minutes: 5 },
    { name: '집중', minutes: 25 },
    { name: '긴 휴식', minutes: 15 },
];

export const STAGE_MS = STAGES.map(stage => stage.minutes * 60 * 1000);
export const TOTAL_MS = STAGE_MS.reduce((sum, duration) => sum + duration, 0);
