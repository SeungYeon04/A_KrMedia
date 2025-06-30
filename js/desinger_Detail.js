import { getImgUrl, getUserAssetPostUrl, getUserAssetUrl } from './all_getuserImg.js';
import { loadComments, addComment } from './desinger_msg_md.js';

const params = new URLSearchParams(window.location.search);
const designerId = params.get('id');
const year = params.get("year");

document.addEventListener("DOMContentLoaded", () => {
  const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIUlEQVR42mP8z8Dwn4EIwDiqAyUY0g0jmQJRFATqAyoAxXwAAgF9D5oTZkXEAAAAASUVORK5CYII=";

  const TeamAssetUrl = (projectname, thumnail) => {
    const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/";
    const fullPath = `${year}/TeamWorkData/${projectname}/${thumnail}`;
    return `${base}${encodeURIComponent(fullPath)}?alt=media`;
  };

  function tryLoadImageByImageTag(imgEl, name, file, fallback) {
    const folders = ["VideoSorce", "VideoSorce01", "VideoSorce02"];
    const base = "https://firebasestorage.googleapis.com/v0/b/jvisiondesign-web.firebasestorage.app/o/";
    const encodedName = encodeURIComponent(name);
    const encodedFile = encodeURIComponent(file);
    const urls = folders.map(folder => `${base}${year}%2FUsersWorkData%2F${encodedName}%2F${folder}%2F${encodedFile}?alt=media`);

    const tryNext = (index) => {
      if (index >= urls.length) {
        imgEl.src = fallback;
        imgEl.classList.add("fallback-img");
        if (imgEl.parentElement) {
          imgEl.parentElement.classList.add("no-image");
        }
        return;
      }
      const img = new Image();
      img.onload = () => imgEl.src = urls[index];
      img.onerror = () => tryNext(index + 1);
      img.src = urls[index];
    };
    tryNext(0);
  }

  fetch(`/data/${year}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const designer = data.디자이너.find(d => d.name === designerId);
      if (!designer) {
        document.querySelector(".detail-container").innerHTML = "<p>디자이너 정보를 찾을 수 없습니다.</p>";
        return;
      }

      const profileImgEl = document.getElementById("profileImg");
      if (profileImgEl) {
        profileImgEl.src = getImgUrl(designer.name);
      }

      document.title = designer.name;
      document.getElementById("designerName").textContent = designer.name;

      const mainProjectContainer = document.querySelector(".detail-project");
      mainProjectContainer.innerHTML = '';

      const allProjects = [];

      const postProjects = data.포스트.filter(p =>
        Array.isArray(p.designerName) ? p.designerName.includes(designer.name) : p.designerName === designer.name
      );
      postProjects.forEach(postData => {
        allProjects.push({ type: 'poster', data: postData, designerName: designer.name });
      });

      const videoProjects = data.비디오.filter(v =>
        Array.isArray(v.designerName) ? v.designerName.includes(designer.name) : v.designerName === designer.name
      );
      videoProjects.forEach(videoData => {
        allProjects.push({ type: 'video', data: videoData, designerName: designer.name });
      });

      const teamProjects = data.팀.filter(t =>
        Array.isArray(t.teamMembers) ? t.teamMembers.includes(designer.name) : t.designerName === designer.name
      );
      teamProjects.forEach(teamData => {
        allProjects.push({ type: 'team', data: teamData, designerName: designer.name });
      });

      allProjects.forEach(project => {
        const projectItemDiv = document.createElement("div");
        projectItemDiv.classList.add("project-item");

        let title = '', typeText = '';
        let mediaElement;

        if (project.type === 'poster') {
          mediaElement = document.createElement("img");
          mediaElement.onerror = () => {
            mediaElement.src = fallbackImg;
            mediaElement.classList.add("fallback-img");
            projectItemDiv.classList.add("no-image");
          };
          mediaElement.src = getUserAssetPostUrl(project.designerName, project.data.posterThumb);
          title = project.data.postName;
          typeText = '포스터';
          projectItemDiv.classList.add('poster-type');
          projectItemDiv.onclick = () => {
            location.href = `../view/postView.html?year=${year}&id=${project.data.id}`;
          };

        } else if (project.type === 'video') {
          mediaElement = document.createElement("img");
          tryLoadImageByImageTag(
            mediaElement,
            project.designerName,
            project.data.videoThumb,
            fallbackImg
          );
          title = project.data.postName || '제목 없음';
          typeText = '비디오';
          projectItemDiv.classList.add('video-type');
          projectItemDiv.onclick = () => {
            location.href = `../view/videoView.html?year=${year}&id=${project.data.id}`;
          };

        } else if (project.type === 'team') {
          mediaElement = document.createElement("img");
          const imageUrl = TeamAssetUrl(project.data.teamfolder, project.data.teamThumbnail);
          console.log(imageUrl);
          const testImg = new Image();
          testImg.onload = () => {
            mediaElement.src = imageUrl;
          };
          testImg.onerror = () => {
            mediaElement.src = fallbackImg;
            mediaElement.classList.add("fallback-img");
            projectItemDiv.classList.add("no-image");
          };
          testImg.src = imageUrl;

          const teamName = project.data.teamName || "";
          const teamMembers = Array.isArray(project.data.teamMembers)
              ? project.data.teamMembers.join('  , ')
              : project.data.teamMembers || "";

            title = `<span style='color:white; font-size:18px'>${teamName}</span><br/><span style='color:#cccccc'>팀원 : ${teamMembers}<span>`;
            typeText = 'TVCF';
            projectItemDiv.classList.add('team-type');
            projectItemDiv.onclick = () => {
              location.href = `../view/teamView.html?year=${year}&id=${project.data.id}`;
            };
          }

        const projectTitleDiv = document.createElement("div");
        projectTitleDiv.innerHTML = `<strong style="font-size:20px; color:#ff6666">${typeText}</strong><br/><strong style='line-height:1.5;color:whilte'>${title}</strong>`;
        projectItemDiv.appendChild(projectTitleDiv);

        mainProjectContainer.appendChild(projectItemDiv);
        if (mediaElement) {
          const imageWrapper = document.createElement("div");
          imageWrapper.classList.add("media-wrapper");
          imageWrapper.appendChild(mediaElement);
          projectItemDiv.appendChild(imageWrapper);
        }

      });

      const comment = designer.profileComment || "";
      const email = designer.profileEmail || "";
      const hope = designer.profileDream || "";

      document.querySelector(".designer-quote").innerHTML = `<strong>${comment}</strong>`;
      document.querySelector(".profile-info").innerHTML = `
        <div class="profile-role">${hope}</div>
        <div class="profile-email">${email}</div>
      `;

      function renderComments() {
        loadComments(year, designerId);
        document.getElementById("commentSubmitBtn")?.addEventListener("click", () => addComment(year, designerId));
      }

      renderComments();
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      document.querySelector(".detail-container").innerHTML = `<p>데이터를 불러오는 중 오류가 발생했습니다: ${error.message}</p>`;
    });
});

fetch(`/data/${year}.json`)
  .then(res => res.json())
  .then(data => {
    const designers = data["디자이너"];
    const currentIndex = designers.findIndex(d => d.name === designerId);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + designers.length) % designers.length;
    const nextIndex = (currentIndex + 1) % designers.length;

    // ← 이전 디자이너 버튼
    document.getElementById("prevDesigner").onclick = () => {
      const prevName = designers[prevIndex].name;
      location.href = `/view/designerDetail.html?year=${year}&id=${encodeURIComponent(prevName)}`;
    };

    // → 다음 디자이너 버튼
    document.getElementById("nextDesigner").onclick = () => {
      const nextName = designers[nextIndex].name;
      location.href = `/view/designerDetail.html?year=${year}&id=${encodeURIComponent(nextName)}`;
    };

    // 썸네일 4개 (앞 2명, 뒤 2명)
const thumbWrap = document.getElementById("designerThumbs");
[-2, -1, 1, 2].forEach(offset => {
  const index = (currentIndex + offset + designers.length) % designers.length;
  const d = designers[index];

  const a = document.createElement("a");
  a.href = `/view/designerDetail.html?year=${year}&id=${encodeURIComponent(d.name)}`;
  a.classList.add("thumb-link"); // ✅ CSS로만 스타일

  const img = document.createElement("img");
  img.src = getImgUrl(d.name);
  img.alt = d.name;
  img.classList.add("thumb-img"); // ✅ CSS로만 스타일

  // 🔷 이름(텍스트) 추가
  const nameSpan = document.createElement("span"); // 이름을 담을 span 태그 생성
  nameSpan.classList.add("designer-name"); // 스타일링을 위한 클래스 추가
  nameSpan.textContent = d.name; // 디자이너 이름 설정

  a.appendChild(img);
  a.appendChild(nameSpan); // 이미지를 추가한 뒤 이름(span) 추가
  thumbWrap.appendChild(a);
});
  });
