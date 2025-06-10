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
    const folders = ["VideoSorce", "VideoSorce01", "VideoSorce02"];
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
      document.querySelector('.project-title').innerHTML = `${videoData.postName}`;
      document.querySelector('.project-client').innerHTML = `클라이언트 : ${videoData.client}`;
      document.querySelector('.project-description').innerHTML = videoData.clientDescription;
      document.querySelector('.project-section-text').innerHTML = videoData.videoDescription;

      // 이미지 로딩 (Image 태그 기반 폴백)
      if (designer) {
        tryLoadImageByImageTag(
          document.querySelector('.project-main-img'),
          designer.name,
          videoData.videoThumb,
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
          if (isArray && cut.img != '') {
            imgHTML = `
                <div class="slideshow-wrapper">
                  <img class="slideshow slideshow-a" data-index="0" data-img="${cut.img[0]}" src="">
                  <img class="slideshow slideshow-b" data-index="0" style="opacity: 0;" src="">
                </div>
              `;
          } else {
            if (cut.img != null) {
              imgHTML = `<img class="single-image" data-img="${cut.img}" src="">`;
            }
          }

          block.innerHTML = `
                <h3>${cut.desc.split('<br/>')[0]}</h3>
                <p>${cut.desc.split('<br/>').slice(1).join('<br/>')}</p>
                ${imgHTML}
              `;

          stillCutContainer.appendChild(block);

          // 이미지 로드 시도
          const baseImgEls = block.querySelectorAll("img[data-img]");
          baseImgEls.forEach((imgEl) => {
            tryLoadImageByImageTag(
              imgEl,
              Array.isArray(videoData.designerName) ? videoData.designerName[0] : videoData.designerName,
              imgEl.dataset.img
            );
          });
        });
        // Slideshow logic
        setInterval(() => {
          document.querySelectorAll('.slideshow-wrapper').forEach((wrapper, i) => {
            const parentCut = videoData.stillCuts[i];
            if (!Array.isArray(parentCut.img)) return;

            const imgA = wrapper.querySelector('.slideshow-a');
            const imgB = wrapper.querySelector('.slideshow-b');
            let current = parseInt(imgA.dataset.index || "0");
            const nextIndex = (current + 1) % parentCut.img.length;

            imgB.dataset.img = parentCut.img[nextIndex];
            imgB.dataset.index = nextIndex;

            tryLoadImageByImageTag(
              imgB,
              Array.isArray(videoData.designerName) ? videoData.designerName[0] : videoData.designerName,
              parentCut.img[nextIndex],
              "img/default.png"
            );

            imgB.onload = () => {
              imgA.style.opacity = 0;
              imgB.style.opacity = 1;

              imgA.classList.remove('slideshow-a');
              imgA.classList.add('slideshow-b');
              imgB.classList.remove('slideshow-b');
              imgB.classList.add('slideshow-a');
            };
          });
        }, 3000);
      }


    // 스토리보드
    const storyboardContain = document.querySelector(".project-section-storyboard");
    // videoData.storyBoard가 존재하고 비어있지 않은지 확인
    if (videoData.storyBoard && videoData.storyBoard.length > 0) {
    // <h1>StoryBoard</h1> 요소 생성 및 추가 (이전 설명에서 수정된 방식)
    const h1Element = document.createElement("h1");
    h1Element.textContent = "StoryBoard";
    const projectStoryBoardDiv = document.querySelector(".project-storyBoard");
    if (projectStoryBoardDiv) {
        projectStoryBoardDiv.appendChild(h1Element);
    } else {
        console.warn(".project-storyBoard 요소를 찾을 수 없습니다.");
    }


    videoData.storyBoard.forEach((cut, index) => {
        const block = document.createElement("div");
        block.className = "storyboard-block";
        const isArray = Array.isArray(cut.img);
        let imgHTML = "";

        // **수정된 부분:** 이미지가 배열이고 배열 안에 요소가 있는지 확인
        if (isArray && cut.img.length > 0) { // <--- 여기가 중요!
            imgHTML = `
                <div class="slideshow-wrapper">
                  <img class="slideshow slideshow-a" data-index="0" data-img="${cut.img[0]}" src="">
                  <img class="slideshow slideshow-b" data-index="0" style="opacity: 0;" src="">
                </div>
              `;
        }
        // 단일 이미지(문자열)인 경우 또는 img가 null이 아닌 경우
        else if (cut.img !== null && cut.img !== undefined && !isArray) {
            imgHTML = `<img class="single-image" data-img="${cut.img}" src="">`;
        }
        // 그 외의 경우 (예: cut.img가 빈 배열이거나, 아예 없거나)는 imgHTML이 빈 문자열로 남음

        // desc가 없을 때를 대비하여 기본값 처리 (이전 설명에서 추가됨)
        const descTitle = cut.desc ? cut.desc.split('<br/>')[0] : '';
        const descContent = cut.desc ? cut.desc.split('<br/>').slice(1).join('<br/>') : '';

        block.innerHTML = `
            <h3>${descTitle}</h3>
            <p>${descContent}</p>
            ${imgHTML}
          `;

        storyboardContain.appendChild(block);

        // 이미지 로드 시도
        const baseImgEls = block.querySelectorAll("img[data-img]");
        baseImgEls.forEach((imgEl) => {
            // imgEl.dataset.img가 undefined나 null이 아닐 때만 로드 시도
            if (imgEl.dataset.img) {
                tryLoadImageByImageTag(
                    imgEl,
                    Array.isArray(videoData.designerName) ? videoData.designerName[0] : videoData.designerName,
                    imgEl.dataset.img
                );
            }
        });
    });

    // Slideshow logic (이전 설명에서 수정됨)
    // storyBoard 배열 내에 슬라이드쇼용 이미지 배열이 하나라도 있을 때만 setInterval 시작
    if (videoData.storyBoard.some(cut => Array.isArray(cut.img) && cut.img.length > 0)) {
        setInterval(() => {
            document.querySelectorAll('.project-section-storyboard .slideshow-wrapper').forEach((wrapper, i) => {
                const parentCut = videoData.storyBoard[i];
                if (!parentCut || !Array.isArray(parentCut.img) || parentCut.img.length === 0) return; // 유효성 다시 확인

                const imgA = wrapper.querySelector('.slideshow-a');
                const imgB = wrapper.querySelector('.slideshow-b');
                if (!imgA || !imgB) return;

                let current = parseInt(imgA.dataset.index || "0");
                const nextIndex = (current + 1) % parentCut.img.length;

                imgB.dataset.img = parentCut.img[nextIndex];
                imgB.dataset.index = nextIndex;

                tryLoadImageByImageTag(
                    imgB,
                    Array.isArray(videoData.designerName) ? videoData.designerName[0] : videoData.designerName,
                    parentCut.img[nextIndex],
                    "img/default.png"
                );

                imgB.onload = () => {
                    imgA.style.opacity = 0;
                    imgB.style.opacity = 1;

                    imgA.classList.remove('slideshow-a');
                    imgA.classList.add('slideshow-b');
                    imgB.classList.remove('slideshow-b');
                    imgB.classList.add('slideshow-a');
                };
                // onerror 핸들러 추가 고려 (이미지 로드 실패 시 슬라이드쇼가 멈추지 않게)
                imgB.onerror = () => {
                    console.error(`스토리보드 슬라이드 이미지 로드 실패: ${imgB.dataset.img}`);
                    // 실패 시에도 다음 슬라이드로 넘어가도록 강제 스왑 로직 추가 가능
                    imgA.style.opacity = 0;
                    imgB.style.opacity = 1;
                    imgA.classList.remove('slideshow-a');
                    imgA.classList.add('slideshow-b');
                    imgB.classList.remove('slideshow-b');
                    imgB.classList.add('slideshow-a');
                };
            });
        }, 3000);
    }
} // storyboard if 문 닫힘
        // 푸터 정보
        const footer = document.querySelector('.project-footer-author');

        videoData.designerName.forEach((name, index) => {
          const designer = data.디자이너.find(d => d.name === name);

          const designName = document.createElement('div');
          const img = document.createElement('img');

          img.className = 'footer-author-img';
          designName.className = 'footer-author-name';

          if (designer) {

            designName.textContent = designer?.name || "Unknown";
            img.src =
              designer ? `https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/2023%2FUsers%2F${encodeURIComponent(designer.name)}.jpg?alt=media`
                : "fallback.jpg";
          }
          footer.appendChild(img);
          footer.appendChild(designName);
        })
    });

});
