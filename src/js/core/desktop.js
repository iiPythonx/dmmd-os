document.querySelector("footer > button").addEventListener("click", () => {
    document.getElementById("start").classList.toggle("hidden");
});

const update_clock = () => {
    const d = new Date();
    let h = d.getHours();
    let m = d.getMinutes().toString().padStart(2, "0");
    document.getElementById("clock").innerText = `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}
setInterval(update_clock, 1000);
update_clock();
