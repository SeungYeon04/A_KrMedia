import { getImgUrl, getUserAssetUrl, getUserAssetPostUrl } from './all_getuserImg.js';
window.getImgUrl = getImgUrl;
const params = new URLSearchParams(window.location.search);
const year = params.get("year");
const postGrid = document.getElementById("post");
const videoGrid = document.getElementById("video");
const teamGrid = document.getElementById("team");

document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;

    // 탭 클래스 전환
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(target).classList.add("active");

    // 🔄 URL 파라미터 수정: tab 값 갱신
    const params = new URLSearchParams(window.location.search);
    params.set("tab", target);

    // URL만 바꾸고 페이지는 유지
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedTab = params.get("tab");

    if (selectedTab) {
      document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));

      const targetButton = document.querySelector(`.tab-button[data-tab="${selectedTab}"]`);
      const targetPanel = document.getElementById(selectedTab);

      if (targetButton && targetPanel) {
        targetButton.classList.add("active");
        targetPanel.classList.add("active");
      } else {
        console.warn('탭 요소를 찾을 수 없음:', selectedTab);
      }
    }
  });
});

// header

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
        reject(new Error("유효한 이미지 URL을 찾지 못했습니다")); // 🔥 명시적으로 에러 던짐
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
    // ✅ POST 탭 (비디오 및 팀 섹션과 동일한 try/catch 패턴 적용)
    const postPromises = [];
    data.포스트.forEach((post, index) => {
      const designer = data.디자이너.find(d => d.name === post.designerName);
      if (!designer) return;

      const urls = [getUserAssetPostUrl(designer.name, post.posterThumb)];
      const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIUlEQVR42mP8z8Dwn4EIwDiqAyUY0g0jmQJRFATqAyoAxXwAAgF9D5oTZkXEAAAAASUVORK5CYII=";
      postPromises.push(
        (async () => {
          let validUrl;
          let isFallback = false;
          try {
            validUrl = await loadFirstValidImageAsync(urls);
          } catch {
            validUrl = fallbackImg;
            isFallback = true;
          }

          const div = document.createElement('div');
          if (isFallback) div.classList.add("no-image");
          div.innerHTML = `
  <a href="./postView.html?year=${year}&id=${encodeURIComponent(post.id)}"
     class="grid-item${isFallback ? " no-image" : ""}">
    <div class="designer-img-wrap">
      ${isFallback ? "" : `<img src="${validUrl}" class="img-responsive">`}
    </div>
    <h3 class="head_title">포스터</h3>
    <h3><span style="font-size: 16px;">${post.postName}</span></h3>
    <p class="kor_sub">디자이너: ${designer.name}</p>
  </a>
`;
          return {
            index,
            html: div.innerHTML
          };
        })()
      );
    });

    (async () => {
      const postResults = await Promise.allSettled(postPromises);
      postResults
        .filter(r => r.status === 'fulfilled' && r.value)
        .sort((a, b) => a.value.index - b.value.index)
        .forEach(r => {
          const div = document.createElement('div');
          div.innerHTML = r.value.html;
          postGrid.appendChild(div);
        });
    })();

    // ✅ VIDEO 탭
    // 비디오 데이터 각각에 대해 Promise를 생성하여 유효한 썸네일 이미지를 병렬로 탐색 (모든 49개 출력 보장)
    const videoPromises = [];
    data.비디오.forEach((video, index) => {
      // 1. 디자이너 정보 찾기 (designerName이 배열일 경우 첫번째 값 사용)
      const designerName = Array.isArray(video.designerName) ? video.designerName[0] : video.designerName;
      const designer = data.디자이너.find(d => d.name === designerName);
      videoPromises.push(
        (async () => {
          let validUrl;
          let isFallback = false;
          try {
            const urls = getUserAssetUrl(designer.name, "VideoSorce", video.thumbnail);
            validUrl = await loadFirstValidImageAsync(urls);
          } catch {
            validUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIUlEQVR42mP8z8Dwn4EIwDiqAyUY0g0jmQJRFATqAyoAxXwAAgF9D5oTZkXEAAAAASUVORK5CYII="
            isFallback = true;
          }
          const div = document.createElement('div');
          if (isFallback) {
            div.classList.add("no-image");
          }
          div.innerHTML = `
            <a href="./videoView.html?year=${year}&id=${encodeURIComponent(video.id)}" class="grid-item${isFallback ? " no-image" : ""}">
              <div class="designer-img-wrap">
                ${isFallback ? "" : `<img src="${validUrl}" alt="${designer.postName || "video"}_비디오썸네일" class="img-responsive">`}
              </div>
              <h3 class="head_title"><span>${Array.isArray(video.designerName) ? video.designerName.join(", ") : video.designerName || "No Name"}</span></h3>
              <h3><span style='font-size:16px'>${video.postName || "No Title"}</span></h3>
            </a>
          `;
          return {
            index,
            html: div.innerHTML,
            noImageDiv: div
          };
        })()
      );
    });
    // 모든 비디오 썸네일 로딩이 끝나면, 순서대로 DOM에 추가 (실패해도 49개 모두 렌더링)
    (async () => {
      const results = await Promise.allSettled(videoPromises);
      const htmlList = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .sort((a, b) => a.value.index - b.value.index)
        .map(r => r.value.html);
      htmlList.forEach(html => {
        const div = document.createElement('div');
        div.innerHTML = html;
        videoGrid.appendChild(div);
      });
    })();


    // 파이어베이스에서 팀이름이나 클라이언트 이름으로 된 폴더를 찾는다. 
    const teamPromises = [];
    data.팀.forEach((team, index) => {
      const folder = encodeURIComponent(team.teamfolder || team.teamName);
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/${year}%2FTeamWorkData%2F${folder}%2F${encodeURIComponent(team.teamThumbnail)}?alt=media`;
      const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIUlEQVR42mP8z8Dwn4EIwDiqAyUY0g0jmQJRFATqAyoAxXwAAgF9D5oTZkXEAAAAASUVORK5CYII=";

      teamPromises.push(
        (async () => {
          let validUrl;
          let isFallback = false;
          try {
            validUrl = await loadFirstValidImageAsync([imageUrl]);
          } catch {
            validUrl = fallbackImg;
            isFallback = true;
          }

          const div = document.createElement('div');
          if (isFallback) div.classList.add("no-image");
          div.innerHTML = `
            <a href="./teamView.html?year=${year}&id=${encodeURIComponent(team.id)}" class="grid-item${isFallback ? " no-image" : ""}">
              <div class="designer-img-wrap">
                ${isFallback ? "" : `<img src="${validUrl}" class="img-responsive">`}
              </div>
              <h3 class="head_title"><span>${team.teamName}</span></h3>
              <h3><span style="font-size: 16px;">${team.videoName || ""}</span></h3>
            </a>
          `;
          return {
            index,
            html: div.innerHTML
          };
        })()
      );
    });

    (async () => {
      const teamResults = await Promise.allSettled(teamPromises);
      teamResults
        .filter(r => r.status === 'fulfilled' && r.value)
        .sort((a, b) => a.value.index - b.value.index)
        .forEach(r => {
          const div = document.createElement('div');
          div.innerHTML = r.value.html;
          teamGrid.appendChild(div);
        });
    })();

  });

