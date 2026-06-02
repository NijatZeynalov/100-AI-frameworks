document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".logo-marquee").forEach((marquee) => {
    const images = Array.from(marquee.querySelectorAll("img"));
    if (images.length === 0) {
      marquee.classList.add("is-ready");
      return;
    }

    const markReady = () => marquee.classList.add("is-ready");
    const imagePromises = images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      if (typeof image.decode === "function") {
        return image.decode().catch(() => undefined);
      }
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    });

    Promise.race([
      Promise.allSettled(imagePromises),
      new Promise((resolve) => setTimeout(resolve, 1400)),
    ]).then(markReady);
  });

  document.querySelectorAll('.rst-content table, .col-md-9[role="main"] table').forEach((table) => {
    if (table.parentElement?.classList.contains("table-scroll")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  document.querySelectorAll("td, li, p").forEach((node) => {
    if (node.childElementCount > 0) return;
    const text = node.textContent.trim();
    if (text === "Pending" || text.startsWith("Status: Pending")) {
      node.innerHTML = node.innerHTML.replace(
        "Pending",
        '<span class="lab-status">Pending</span>',
      );
    }
  });

  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer noopener");
  });
});
