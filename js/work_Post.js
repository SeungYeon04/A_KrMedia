import { getImgUrl, getUserAssetUrl , getUserAssetPostUrl } from './all_getuserImg.js';
window.getImgUrl = getImgUrl;

const year = localStorage.getItem("selectedYear") || "2023";
const postGrid = document.getElementById("post");
const videoGrid = document.getElementById("video");
const teamGrid = document.getElementById("team");

// 메뉴 클릭시 탭 전환
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;

    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});

// header
fetch("/module/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-md").innerHTML = data;
  });

// 이미지 URL 중 유효한 첫 번째를 찾는 함수 (콜백 버전)
function loadFirstValidImage(urls, onSuccess, onError) {
  const tryNext = (index) => {
    if (index >= urls.length) {
      onError();
      return;
    }
    const img = new Image();
    img.onload = () => onSuccess(urls[index]);
    img.onerror = () => tryNext(index + 1);
    img.src = urls[index];
  };
  tryNext(0);
}

// 이미지 URL 중 유효한 첫 번째를 비동기로 찾는 함수 (Promise 버전)
function loadFirstValidImageAsync(urls) {
  return new Promise((resolve, reject) => {
    const tryNext = (index) => {
      if (index >= urls.length) {
        reject();
        return;
      }
      const img = new Image();
      img.onload = () => resolve(urls[index]);
      img.onerror = () => tryNext(index + 1);
      img.src = urls[index];
    };
    tryNext(0);
  });
}

// 데이터 렌더링
fetch(`/data/${year}.json`)
  .then(res => res.json())
  .then(data => {
    // ✅ POST 탭
    const postPromises = data.포스트.map(async (post, index) => {
      const designer = data.디자이너.find(d => d.name === post.designerName);
      if (!designer) return null;

      const urls = [getUserAssetPostUrl(designer.name, post.posterThumb)];
      try {
        const validUrl = await loadFirstValidImageAsync(urls);
        return { index, html: `
          <a href="./postView.html?id=${encodeURIComponent(post.id)}" class="grid-item">
            <div class="designer-img-wrap">
              <img src="${validUrl}" alt="${post.postName}_포스터" class="img-responsive">
            </div>
            <h3 class="head_title"><span>${designer.name}</span></h3>
            <h3><span>${post.postName}</span></h3>
          </a>
        `};
      } catch {
        return null;
      }
    });

    Promise.all(postPromises).then(results => {
      results
        .filter(Boolean)
        .sort((a, b) => a.index - b.index)
        .forEach(({ html }) => {
          const div = document.createElement('div');
          div.innerHTML = html;
          postGrid.appendChild(div);
        });
    });

//    ✅ VIDEO 탭 (refactored to use loadFirstValidImage)
    data.비디오.forEach(video => {
      const designer = data.디자이너.find(d => d.name === post.designerName);
      if (!designer) return;
      
      const urls = getUserAssetUrl(designer.name, "VideoSorce", designer.videoFile);
      loadFirstValidImage(urls, (validUrl) => {
        const videoDiv = document.createElement('div');
        videoDiv.innerHTML = `
        <a href="./videoView.html?id=${encodeURIComponent(video.id)}" class="grid-item">
            <div class="designer-img-wrap">
              <img src="${validUrl}" alt="${designer.name}_비디오썸네일" class="img-responsive">
            </div>
            <h3 class="head_title"><span>${designer.name}</span></h3>
            <h3><span>${designer.vidioName}</span></h3>
          </a>
        `;
        videoGrid.appendChild(videoDiv);
      }, () => {
        console.warn("No valid video thumbnail found for", designer.name);
      });
    });

    // ✅ TEAM 탭 (예시)
    // data.디자이너.forEach(designer => {
    //   const teamDiv = document.createElement('div');
    //   teamDiv.innerHTML = `
    //     <div class="grid-item">
    //       <div class="designer-img-wrap">
    //         <img src="${getUserAssetUrl(designer.name, "PosterSorce", designer.posterThumb)}" alt="${designer.name}" class="img-responsive">
    //       </div>
    //       <h2 class="head_title"><span>${designer.teamWork}</span></h2>
    //     </div>
    //   `;
    //   teamGrid.appendChild(teamDiv);
    // });
  });
