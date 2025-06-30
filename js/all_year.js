function goTo(page) {
  const params = new URLSearchParams(window.location.search); // ← 이 줄 추가
  window.year = params.get("year");
  window.location.href = page + `?year=${year}`;
}
function goToYear(year) {
  window.location.href = `intro.html?year=${year}`
}
window.goTo = goTo;
const currentPage = location.pathname.split("/").pop().toLowerCase();

  const checkHeaderReady = setInterval(() => {
    const navLinks = document.querySelectorAll(".nav a");
    const header = document.querySelector(".header");

    if (navLinks.length > 0) {
      navLinks.forEach(link => {
        const match = link.getAttribute("onclick")?.match(/goTo\('(.+?)'\)/);
        if (!match) return;
        const linkPage = match[1].toLowerCase().replace('.html', '');
        const currentPath = currentPage.replace('.html', '');

        let resolvedPath = ['teamview', 'postview', 'videoview'].includes(currentPath) ? 'works' : currentPath;
        resolvedPath = 'designerdetail'.includes(currentPath) ? 'designer' : resolvedPath;
  
        if (resolvedPath === linkPage) {
          link.classList.add("active-nav");
        } else {
          link.classList.remove("active-nav");
        }
      });

      // Scroll event for header background change
      if (header) {
        window.addEventListener("scroll", () => {
          if (window.scrollY > 10) {
            header.classList.add("scrolled");
          } else {
            header.classList.remove("scrolled");
          }
        });
      }
      clearInterval(checkHeaderReady);
    }
  }, 50);
