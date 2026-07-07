async function run() {
    try {
        const res = await fetch("https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600 ");
        console.log("Status:", res.status, res.statusText);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
run();
