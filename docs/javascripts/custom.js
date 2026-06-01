document.addEventListener("DOMContentLoaded", () => {
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
