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

    // ✅ VIDEO 탭
    // 비디오 데이터 각각에 대해 Promise를 생성하여 유효한 썸네일 이미지를 병렬로 탐색
    const videoPromises = data.비디오.map(async (video, index) => {
      // 1. 디자이너 정보 찾기 (designerName이 배열일 경우 첫번째 값 사용)
      const designerName = Array.isArray(video.designerName) ? video.designerName[0] : video.designerName;
      const designer = data.디자이너.find(d => d.name === designerName);
      if (!designer) return null;

      // 2. 여러 VideoSorce 폴더 중 유효한 이미지 URL을 병렬로 탐색
      try {
      // 3. 첫 번째로 유효한 이미지 URL을 찾는
        const urls = getUserAssetUrl(designer.name, "VideoSorce", designer.videoFile);
        const validUrl = await loadFirstValidImageAsync(urls);
      // 4. HTML 조각 반환 (원본 순서 유지를 위해 index 포함)
        return { index, html: `
          <a href="./videoView.html?id=${encodeURIComponent(video.id)}" class="grid-item">
            <div class="designer-img-wrap">
              <img src="${validUrl}" alt="${designer.postName}_비디오썸네일" class="img-responsive">
            </div>
            <h3 class="head_title"><span>${Array.isArray(video.designerName) ? video.designerName.join(", ") : video.designerName}</span></h3>
            <h3><span>${video.postName}</span></h3>
          </a>
        `};
      } catch {
        // 5. 유효한 이미지가 없으면 null 반환
        return null;
      }
    });
    // 6. 모든 비디오 썸네일 로딩이 끝나면, 순서대로 DOM에 추가
    Promise.all(videoPromises).then(results => {
      results
        .filter(Boolean)
        .sort((a, b) => a.index - b.index) // 원본 순서 유지
        .forEach(({ html }) => {
          const div = document.createElement('div');
          div.innerHTML = html;
          videoGrid.appendChild(div);
        });
    });

    
    // ✅ TEAM 탭 (신 구조 - data.팀 사용)
    // ✅ TEAM 탭
    data.팀.forEach(team => {
      const imgUrl = `https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/${year}%2FTeamWorkData%2F${encodeURIComponent(team.teamName)}%2F${encodeURIComponent(team.teamThumbnail)}?alt=media`;
      const description = team.teamDescription || "";

      const teamDiv = document.createElement('div');
      teamDiv.innerHTML = `
       <a href="./view/teamView.html?id=${encodeURIComponent(team.id)}" class="grid-item">
          <div class="designer-img-wrap">
            <img src="${imgUrl}" alt="${team.teamName}_썸네일" class="img-responsive">
          </div>
          <h2 class="head_title"><span>${team.teamName}</span></h2>
        </a>
      `;
      teamGrid.appendChild(teamDiv);
    });
  });

{/* <p class="eng_sub">${team.teamNameEng}</p>
        <p class="kor_sub">팀원: ${team.teamMembers.join(", ")}</p>
  */}

  
