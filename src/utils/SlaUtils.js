// src/utils/slaUtils.js

export const getSlaTarget = (priority) => {
  const targets = {
    P1: { response: 15, resolution: 240 },
    P2: { response: 30, resolution: 480 },
    P3: { response: 60, resolution: 960 },
    P4: { response: 240, resolution: 4320 },
    P5: { response: 480, resolution: 7200 },
  };
  return targets[priority] || { response: 60, resolution: 960 };
};

export const getTimeRemaining = (createdAt, targetMinutes) => {
  const createdTime = new Date(createdAt).getTime();
  const now = new Date().getTime();
  const elapsed = (now - createdTime) / 60000; // ms → min
  const remaining = targetMinutes - elapsed;
  return remaining <= 0 ? 0 : Math.round(remaining);
};

export const getSlaStatus = (createdAt, priority, type = 'response') => {
  const targets = getSlaTarget(priority);
  const targetMinutes = type === 'response' ? targets.response : targets.resolution;
  const remaining = getTimeRemaining(createdAt, targetMinutes);
  return remaining <= 0 ? 'Breached' : `${remaining} min left`;
};
