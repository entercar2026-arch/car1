async function run() {
    const res = await fetch("https://hips.hearstapps.com/hmg-prod/images/2023-lexus-is500-f-sport-performance-122-1663166887.jpg", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });
    console.log(res.status, res.statusText);
}
run();
