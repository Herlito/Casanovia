const wedding = { id: 'boda-zenaida-ronny-1399', createdByUserId: undefined, createdByUserName: undefined };
const user = { isAuthenticated: true, level: 3, id: 'user-1787935045057', username: 'M21', createdWeddingIds: ['boda-auna-clinica-7021'], assignedWeddingIds: ['boda-auna-clinica-7021'] };

const uName = (user.username || '').trim().toLowerCase();
const uId = user.id;
const createdIds = user.createdWeddingIds || [];
const assignedIds = user.assignedWeddingIds || [];

let result = false;
if (createdIds.includes(wedding.id)) result = true;
else if (assignedIds.includes(wedding.id)) result = true;
else if (wedding.createdByUserId && (wedding.createdByUserId === uId || wedding.createdByUserId === user.username)) result = true;
else if (wedding.createdByUserName && wedding.createdByUserName.trim().toLowerCase() === uName) result = true;

console.log('Result for Zenaida:', result);
