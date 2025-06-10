
fetch("../module/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-md").innerHTML = data;

    requestAnimationFrame(() => {
      const year = sessionStorage.getItem("selectedYear");
      if (year) {
        const count = parseInt(year) - 1999 + 1;
        const displayText = `제 ${count}회 ${year} 졸업전`;
        const el = document.querySelector("#header-md #exhibition-info");
        if (el) el.textContent = displayText;
      }
    });
  });


document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  const year = sessionStorage.getItem("selectedYear") || "2023";

  fetch(`/data/${year}.json`)
    .then(res => res.json())
    .then(data => {
      const postData = data.포스트.find(p => p.id === postId);
      if (!postData) {
        document.body.innerHTML = "<p>해당 포스트를 찾을 수 없습니다.</p>";
        return;
      }

      const designer = data.디자이너.find(d => d.name === postData.designerName);
      // 타이틀 및 설명 채우기
      document.title = postData.postName;
      document.querySelector('.project-client').innerHTML  = `클라이언트 : ${postData.client}`;
      document.querySelector('.project-description').innerHTML  = postData.clientDescription;
      document.querySelector('.project-section-text').innerHTML  = postData.subDescription;

      // 이미지 동적 처리 (필요 시 JSON에 추가해도 좋음)
document.querySelector('.project-main-img').src =
  postData.posterThumb
    ? `https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsersWorkData%2F${encodeURIComponent(designer.name)}%2F${encodeURIComponent(postData.posterThumb)}?alt=media`
    : "default.png";

document.querySelector('.project-section-image img').src =
  postData.posterFile
    ? `https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsersWorkData%2F${encodeURIComponent(designer.name)}%2F${encodeURIComponent(postData.posterFile)}?alt=media`
    : "default2.png";

      // 푸터 정보
      document.querySelector('.footer-author-name').textContent = designer?.name || "Unknown";
      document.querySelector('.footer-author-img').src =
        designer ? `https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsers%2F${encodeURIComponent(designer.name)}.jpg?alt=media`
        : "fallback.jpg";
    });
});
