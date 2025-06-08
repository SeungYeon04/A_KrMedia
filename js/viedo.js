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
  function tryLoadImageByImageTag(imgEl, name, file, fallback) {
    const folders = ["VideoSorce", "VideoSorce1", "VideoSorce2"];
    const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/";
    const encodedName = encodeURIComponent(name);
    const encodedFile = encodeURIComponent(file);
    const urls = folders.map(folder => `${base}2023%2FUsersWorkData%2F${encodedName}%2F${folder}%2F${encodedFile}?alt=media`);

    const tryNext = (index) => {
      if (index >= urls.length) {
        imgEl.src = fallback;
        return;
      }
      const img = new Image();
      img.onload = () => imgEl.src = urls[index];
      img.onerror = () => tryNext(index + 1);
      img.src = urls[index];
    };
    tryNext(0);
  }

  const params = new URLSearchParams(window.location.search);
  const videoId = params.get('id');
  const year = sessionStorage.getItem("selectedYear") || "2023";

  fetch(`/data/${year}.json`)
    .then(res => res.json())
    .then(data => {
      const videoData = data.비디오.find(p => p.id === videoId);
      if (!videoData) {
        document.body.innerHTML = "<p>해당 포스트를 찾을 수 없습니다.</p>";
        return;
      }

      const designerNames = Array.isArray(videoData.designerName) ? videoData.designerName : [videoData.designerName];
      const designer = data.디자이너.find(d => designerNames.includes(d.name));
      // 타이틀 및 설명 채우기
      document.title = videoData.postName;
      document.querySelector('.project-title').innerHTML  = `${videoData.postName}`;
      document.querySelector('.project-client').innerHTML  = `클라이언트 : ${videoData.client}`;
      document.querySelector('.project-description').innerHTML  = videoData.clientDescription;
      document.querySelector('.project-section-text').innerHTML  = videoData.videoDescription;

      // 이미지 로딩 (Image 태그 기반 폴백)
      if (designer) {
        tryLoadImageByImageTag(
          document.querySelector('.project-main-img'),
          designer.name,
          videoData.vedioThumb,
          "img/default.png"
        );
      }
            // Vimeo 비디오 삽입
      if (videoData.vimeoId) {
        const iframe = document.createElement("iframe");
        iframe.src = `https://player.vimeo.com/video/${videoData.vimeoId}`;
        iframe.style.aspectRatio = "16 / 9";
        iframe.style.width = "1440px";
        iframe.style.maxWidth = "100%";
        iframe.style.height = "auto";
        iframe.style.alignItems = "center";
        iframe.frameBorder = "0";
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.allowFullscreen = true;

        const container = document.querySelector('.project-section-image');
        container.innerHTML = '<div class="blur-background"></div>'; // blur 유지
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";
        container.appendChild(iframe);
      }
      const stillCutContainer = document.querySelector('.project-section-stillcut');
      if (videoData.stillCuts && Array.isArray(videoData.stillCuts)) {
        const encodedName = encodeURIComponent(
          Array.isArray(videoData.designerName) ? videoData.designerName[0] : videoData.designerName
        );
        videoData.stillCuts.forEach((cut, index) => {
          const block = document.createElement("div");
          block.className = "stillcut-block";
          const isArray = Array.isArray(cut.img);
          let imgHTML = "";
          if (isArray) {
            imgHTML = `
              <div class="slideshow-wrapper">
                <img class="slideshow slideshow-a" data-index="0" src="https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsersWorkData%2F${encodedName}%2FVideoSorce%2F${encodeURIComponent(cut.img[0])}?alt=media">
                <img class="slideshow slideshow-b" data-index="0" style="opacity: 0;" src="">
              </div>
            `;
          } else {
            imgHTML = `<img src="https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsersWorkData%2F${encodedName}%2FVideoSorce%2F${encodeURIComponent(cut.img)}?alt=media">`;
          }
          block.innerHTML = `
            <h3>${cut.desc.split('<br/>')[0]}</h3>
            <p>${cut.desc.split('<br/>').slice(1).join('<br/>')}</p>
            ${imgHTML}
          `;
          stillCutContainer.appendChild(block);
        });
        // Slideshow logic (two static <img> tags crossfade)
        setInterval(() => {
          document.querySelectorAll('.slideshow-wrapper').forEach((wrapper, i) => {
            const parentCut = videoData.stillCuts[i];
            if (!Array.isArray(parentCut.img)) return;

            const encodedName = encodeURIComponent(
              Array.isArray(videoData.designerName) ? videoData.designerName[0] : videoData.designerName
            );

            const imgA = wrapper.querySelector('.slideshow-a');
            const imgB = wrapper.querySelector('.slideshow-b');
            let current = parseInt(imgA.dataset.index || "0");
            const nextIndex = (current + 1) % parentCut.img.length;
            const nextSrc = `https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsersWorkData%2F${encodedName}%2FVideoSorce%2F${encodeURIComponent(parentCut.img[nextIndex])}?alt=media`;

            imgB.src = nextSrc;
            imgB.dataset.index = nextIndex;

            imgB.onload = () => {
              imgA.style.opacity = 0;
              imgB.style.opacity = 1;

              // swap class names
              imgA.classList.remove('slideshow-a');
              imgA.classList.add('slideshow-b');
              imgB.classList.remove('slideshow-b');
              imgB.classList.add('slideshow-a');
            };
          });
        }, 3000);
      }

      // 푸터 정보
      document.querySelector('.footer-author-name').textContent = designer?.name || "Unknown";
      document.querySelector('.footer-author-img').src =
        designer ? `https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsers%2F${encodeURIComponent(designer.name)}.jpg?alt=media`
        : "fallback.jpg";

    });
});
