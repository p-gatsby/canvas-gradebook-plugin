async function autoGradeCanvas(accessToken, courseId) {
  if (!accessToken) {
    console.error("❌ ERROR: No access token provided!");
    return;
  }

  // Load Axios if not available
  if (typeof axios === "undefined") {
    console.log("⏳ Axios is not available, loading now...");
    await new Promise((resolve) => {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
      script.onload = resolve;
      document.head.appendChild(script);
    });
    console.log("Axios loaded successfully!");
  } else {
    console.log("Axios is already loaded.");
  }

  let studentData = {};
  function collectData() {
    document.querySelectorAll(".slick-row").forEach((row) => {
      let studentIdClass = [...row.classList].find((cls) =>
        cls.startsWith("student_")
      );
      let studentId = studentIdClass
        ? studentIdClass.replace("student_", "")
        : null;

      if (!studentId) return;

      if (!studentData[studentId]) {
        studentData[studentId] = {};
      }

      row.querySelectorAll(".slick-cell.assignment").forEach((cell) => {
        let assignmentClass = [...cell.classList].find((cls) =>
          cls.startsWith("assignment_")
        );
        let assignmentId = assignmentClass
          ? assignmentClass.replace("assignment_", "")
          : null;

        if (!assignmentId) return;

        let inputField = cell.querySelector(
          'input[type="text"], input.css-f7qphh-textInput'
        );
        let gradeSpan = cell.querySelector(".Grade");
        let gradeValue = inputField
          ? inputField.value.trim()
          : gradeSpan
          ? gradeSpan.innerText.trim()
          : null;

        if (gradeValue && gradeValue !== "" && gradeValue !== "–") {
          studentData[studentId][assignmentId] = gradeValue;
        } else {
          studentData[studentId][assignmentId] = 0; // Assign numerical 0 to missing grades
        }
      });
    });
  }

  // Observe dynamic changes
  const observer = new MutationObserver(() => {
    console.log("Collecting data...");
    collectData();
  });

  observer.observe(document.querySelector("#gradebook_grid"), {
    childList: true,
    subtree: true,
  });

  console.log("Start scrolling through the gradebook...");
  console.log("When you are done, type 'done()' in the console.");

  async function saveGrades(studentData) {
    let missingGrades = [];

    for (let studentId in studentData) {
      for (let assignmentId in studentData[studentId]) {
        let grade = studentData[studentId][assignmentId];
        if (grade === 0) {
          // Only update missing grades with 0
          missingGrades.push({ studentId, assignmentId });
        }
      }
    }

    if (missingGrades.length === 0) {
      console.log("No missing grades to update.");
      return;
    }

    console.log("Updating missing grades...");

    let total = missingGrades.length;
    let progress = 0;

    function updateProgress() {
      let percentage = Math.round((progress / total) * 100);
      let barCount = Math.round((percentage / 100) * 20);
      let bar = "█".repeat(barCount).padEnd(20, "-");
      console.clear();
      console.log(`${bar} ${percentage}% Complete.`);
    }

    for (let { studentId, assignmentId } of missingGrades) {
      try {
        const url = `/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${studentId}`;
        const payload = {
          submission: {
            assignment_id: assignmentId,
            user_id: studentId,
            posted_grade: 0,
          },
          include: ["visibility", "sub_assignment_submissions"],
          prefer_points_over_scheme: true,
          originator: "gradebook",
        };

        await axios.put(url, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        progress++;
        updateProgress();
      } catch (error) {
        console.error(
          `Failed to update grade for User ID: ${studentId}, Assignment ID: ${assignmentId}`,
          error
        );
      }
    }
    console.log("✅ All missing grades updated!");
  }

  window.done = async function () {
    observer.disconnect(); // Stop observing
    console.log("Final student data:", studentData);
    await saveGrades(studentData);
    return studentData;
  };
}
