const { indexedDB } = require('fake-indexeddb');
// We can't easily query the user's IndexedDB from the server because it's running in their browser!
console.log("IndexedDB is client side.");
