document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("apiKey");
  const courseIdInput = document.getElementById("courseID");
  const toggleApiKeyButton = document.getElementById("toggleApiKey");
  const toggleIcon = toggleApiKeyButton.querySelector("i");
  const segments = document.querySelectorAll(".win98-segment");
  const loadingBar = document.getElementById("loadingBar");
  const searchGif = document.getElementById("searchGif");
  const saveGrades = document.getElementById("saveGrades");
  const progressText = document.getElementById("progressText");
  const searchButton = document.getElementById("searchCourse");
  const refreshButton = document.getElementById("refreshBrowser");
  const progressContainer = document.getElementById("progressContainer");

  progressContainer.style.display = "none";
  refreshButton.style.display = "none";

  toggleApiKeyButton.addEventListener("click", function () {
    const isPassword = apiKeyInput.type === "password";
    apiKeyInput.type = isPassword ? "text" : "password";
    toggleIcon.classList.toggle("fa-eye");
    toggleIcon.classList.toggle("fa-eye-slash");
  });

  function startLoading(callback) {
    let index = 0;

    progressContainer.style.display = "flex";
    progressText.textContent = "0%";

    segments.forEach((seg) => (seg.style.opacity = "0"));

    const interval = setInterval(() => {
      if (index < segments.length) {
        segments[index].style.opacity = "1";
        let progress = Math.round(((index + 1) / segments.length) * 100);
        progressText.textContent = progress + "%";
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (callback) callback();
        }, 500);
      }
    }, 300);
  }

  searchButton.addEventListener("click", function () {
    searchGif.style.display = "block";
    searchButton.disabled = true;
    saveGrades.disabled = true;
    progressContainer.style.display = "flex";

    startLoading(() => {
      searchGif.style.display = "none";
      saveGrades.disabled = false;
    });
  });

  saveGrades.addEventListener("click", function () {
    const accessToken = apiKeyInput.value.trim();
    const courseId = courseIdInput.value.trim();

    if (!accessToken || !courseId) {
      alert("ERROR: API Key and Course ID are required to proceed.");
      return;
    }

    saveGrades.textContent = "Saving...";
    saveGrades.disabled = true;

    startLoading(() => {
      progressContainer.style.display = "none";
      saveGrades.style.display = "none";

      refreshButton.style.display = "inline-block";
      refreshButton.disabled = false;
    });
  });

  refreshButton.addEventListener("click", function () {
    progressContainer.style.display = "none";
    saveGrades.style.display = "inline-block";
    saveGrades.disabled = true;
    searchButton.disabled = false;
    refreshButton.style.display = "none";
  });
});
