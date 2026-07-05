const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(/onUpdateBookingStatus\((.*?)\)/g, 'startTransition(() => onUpdateBookingStatus($1))');
content = content.replace(/onDeleteBooking\((.*?)\)/g, 'startTransition(() => onDeleteBooking($1))');
content = content.replace(/onApproveReview\((.*?)\)/g, 'startTransition(() => onApproveReview($1))');
content = content.replace(/onDeleteReview\((.*?)\)/g, 'startTransition(() => onDeleteReview($1))');

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard INP 3!");
