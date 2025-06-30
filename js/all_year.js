// all_year.js

// 중복 선언 방지
if (typeof window.currentPage === "undefined") {
  window.currentPage = location.pathname.split("/").pop().toLowerCase();
}

function goTo(page) {
  const params = new URLSearchParams(window.location.search);
  window.year = params.get("year");
  window.location.href = `${page}?year=${year}`;
}

function goToYear(year) {
  window.location.href = `intro.html?year=${year}`;
}

window.goTo = goTo;

document.addEventListener("click", (event) => {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.querySelector(".nav");
  const icon = document.querySelector(".menu-icon");
  const closeBtn = document.querySelector(".menu-close-btn"); // X 버튼 요소 가져오기

  // 필수 요소가 없으면 함수 종료
  if (!toggle || !menu || !icon || !closeBtn) return;

  const isMenuOpen = toggle.checked; // 현재 메뉴가 열려있는지 확인

  // 클릭된 요소가 메뉴 아이콘(label), 실제 토글 체크박스(input), 또는 X 버튼인 경우
  const clickedMenuTrigger = icon.contains(event.target) || event.target === toggle || event.target.htmlFor === 'menu-toggle' || event.target === closeBtn;

  if (clickedMenuTrigger) {
    // X 버튼을 클릭한 경우 메뉴를 닫습니다.
    if (event.target === closeBtn) {
      toggle.checked = false;
      console.log("❎ X 버튼 클릭 → 메뉴 닫힘");
    }
    // 메뉴 아이콘이나 토글 클릭 시는 브라우저 기본 동작에 맡김 (열리거나 닫힘)
    return; // 이 경우 더 이상 아래 코드를 실행하지 않습니다.
  }

  // 메뉴가 열려있고, 메뉴 아이콘/토글/X 버튼 외의 다른 곳을 클릭했다면 메뉴 닫기
  // (이전 요청대로 .nav 내부 클릭도 닫힘 처리)
  if (isMenuOpen) {
    toggle.checked = false; // 메뉴 닫기
    console.log("❎ 외부 클릭 → 메뉴 닫힘");
  }
});

// nav 활성화 및 스크롤 이벤트
if (typeof window.checkHeaderReady === "undefined") {
  window.checkHeaderReady = setInterval(() => {
    const navLinks = document.querySelectorAll(".nav a");
    const header = document.querySelector(".header");

    if (navLinks.length > 0) {
      navLinks.forEach((link) => {
        const match = link.getAttribute("onclick")?.match(/goTo\('(.+?)'\)/);
        if (!match) return;
        const linkPage = match[1].toLowerCase().replace(".html", "");
        const currentPath = currentPage.replace(".html", "");

        let resolvedPath = ["teamview", "postview", "videoview"].includes(currentPath)
          ? "works"
          : currentPath;
        resolvedPath = "designerdetail".includes(currentPath) ? "designer" : resolvedPath;

        if (resolvedPath === linkPage) {
          link.classList.add("active-nav");
        } else {
          link.classList.remove("active-nav");
        }
      });

      if (header) {
        window.addEventListener("scroll", () => {
          header.classList.toggle("scrolled", window.scrollY > 10);
        });
      }

      clearInterval(window.checkHeaderReady);
    }
  }, 50);
}