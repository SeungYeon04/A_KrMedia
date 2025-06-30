fetch("/module/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-md").innerHTML = data;
    requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      window.year = params.get("year");
      if (year) {
        const sp = document.getElementById("exhition");
        const buttons = document.querySelectorAll(".year-selector button");
        buttons.forEach(btn => {
          if (btn.textContent === year) {
            btn.style.color = "#ff6363";
            btn.style.fontWeight = "bold";
            btn.style.fontSize = "15px";
          }else{
            btn.style.fontWeight = "normal";
            btn.style.fontSize = "13px";
          }
        });
        const count = parseInt(year) - 1999;
        const displayText = `제 ${count}회 ${year} 졸업전`;
        const el = document.querySelector("#header-md #exhibition-info");
        if (el) el.textContent = displayText;
        if (sp) sp.textContent = `Exhibition ${year}`;
      }else{
        alert("년도를 선택해주세요");
        window.location.href = "/index.html";
      }
    });
  });
