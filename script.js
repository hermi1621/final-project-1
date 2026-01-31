

const translations = { en: {}, am: {} };
let currentLanguage = "en";
let mediaRecorder;
let recordedChunks = [];


function toggleLanguage(lang) {
  currentLanguage = lang;
  document.querySelectorAll(".lang-btn").forEach((btn) => btn.classList.remove("active"));
  document.getElementById(lang + "-btn").classList.add("active");

  document.querySelectorAll("[data-" + lang + "]").forEach((el) => {
    el.textContent = el.getAttribute("data-" + lang);
  });

  updatePlaceholders(lang);
}

function updatePlaceholders(lang) {
  const placeholders = {
    en: {
      fullName: "Enter your full name",
      email: "Enter your email address",
      age: "Enter your age",
      location: "Enter your location",
      password: "Create a password",
      loginEmail: "Enter your email",
      loginPassword: "Enter your password",
    },
    am: {
      fullName: "ሙሉ ስምዎን ያስገቡ",
      email: "የኢሜል አድራሻዎን ያስገቡ",
      age: "እድሜዎን ያስገቡ",
      location: "አካባቢዎን ያስገቡ",
      password: "የይለፍ ቃል ይፍጠሩ",
      loginEmail: "ኢሜልዎን ያስገቡ",
      loginPassword: "የይለፍ ቃልዎን ያስገቡ",
    },
  };

  Object.keys(placeholders[lang]).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = placeholders[lang][id];
  });
}


function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
  document.body.style.overflow = "auto";

  if (modalId === "signupModal" && mediaRecorder && mediaRecorder.state === "recording") {
    stopVideoRecording();
  }
}

window.onclick = (event) => {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
    document.body.style.overflow = "auto";
  }
};


async function startVideoRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.srcObject = stream;
    videoPreview.style.display = "block";
    videoPreview.play();

    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      videoPreview.srcObject = null;
      videoPreview.src = url;
      videoPreview.controls = true; 
      videoPreview.recordedBlob = blob;
    };

    mediaRecorder.start();
    document.getElementById("startRecording").style.display = "none";
    document.getElementById("stopRecording").style.display = "inline-flex";
  } catch (error) {
    console.error("Camera error:", error);
    alert(
      currentLanguage === "en"
        ? "Unable to access camera. Please check permissions."
        : "ካሜራ መድረስ አልተቻለም። ፈቃዶችን ያረጋግጡ።"
    );
  }
}

function stopVideoRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    const stream = document.getElementById("videoPreview").srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());

    document.getElementById("startRecording").style.display = "inline-flex";
    document.getElementById("stopRecording").style.display = "none";
  }
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startRecording");
  const stopBtn = document.getElementById("stopRecording");

  if (startBtn) startBtn.addEventListener("click", startVideoRecording);
  if (stopBtn) stopBtn.addEventListener("click", stopVideoRecording);

  // Signup form submit
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const signupData = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        age: document.getElementById("age").value,
        location: document.getElementById("location").value,
        momType: document.getElementById("momType").value,
        password: document.getElementById("password").value,
        video: document.getElementById("videoPreview").recordedBlob || null,
        photo: "https://via.placeholder.com/50"
      };

      if (
        !signupData.fullName ||
        !signupData.email ||
        !signupData.age ||
        !signupData.location ||
        !signupData.momType ||
        !signupData.password
      ) {
        alert("Please fill all fields!");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(signupData));
      alert("Account created successfully! 🎉");

      window.location.href = "post.html";
    });
  }

  // POSTS WITH LOCALSTORAGE
  const postForm = document.getElementById("textPostForm");
  const postInput = document.getElementById("postInput");
  const postFile = document.getElementById("postFile");
  const postsContainer = document.getElementById("postsContainer");

  // Load posts from localStorage
  function loadPosts() {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.forEach((post) => displayPost(post));
  }

  function displayPost(post) {
    const postCard = document.createElement("div");
    postCard.classList.add("post-card-item");

    // Header
    const postHeader = document.createElement("div");
    postHeader.classList.add("post-header");

    const profilePhoto = document.createElement("img");
    profilePhoto.src = post.profilePhoto || "https://via.placeholder.com/50";
    profilePhoto.alt = "Profile";
    profilePhoto.classList.add("post-profile-photo");

    const userName = document.createElement("span");
    userName.classList.add("post-user-name");
    userName.textContent = post.userName || "User";

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-post-btn");
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => {
      removePost(post.id);
      postCard.remove();
    });

    postHeader.appendChild(profilePhoto);
    postHeader.appendChild(userName);
    postHeader.appendChild(deleteBtn);

    // Content
    const postContent = document.createElement("div");
    if (post.text) {
      const p = document.createElement("p");
      p.textContent = post.text;
      postContent.appendChild(p);
    }
    if (post.image) {
      const img = document.createElement("img");
      img.src = post.image;
      img.alt = "Post Image";
      img.classList.add("post-img");
      postContent.appendChild(img);
    }

    postCard.appendChild(postHeader);
    postCard.appendChild(postContent);
    postsContainer.prepend(postCard);
  }

  function savePost(post) {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.unshift(post);
    localStorage.setItem("posts", JSON.stringify(posts));
  }

  function removePost(id) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts = posts.filter((p) => p.id !== id);
    localStorage.setItem("posts", JSON.stringify(posts));
  }

  function addPost() {
    const text = postInput.value.trim();
    const file = postFile.files[0];
    if (!text && !file) return;

    let imageUrl = null;
    if (file) {
      imageUrl = URL.createObjectURL(file);
    }

    const post = {
      id: Date.now(),
      text: text || null,
      image: imageUrl,
      userName: JSON.parse(localStorage.getItem("currentUser"))?.fullName || "User",
      profilePhoto: JSON.parse(localStorage.getItem("currentUser"))?.photo || "https://via.placeholder.com/50",
    };

    savePost(post);
    displayPost(post);

    postInput.value = "";
    postFile.value = "";
  }

  if (postForm) {
    postForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addPost();
    });
  }

  if (postInput) {
    postInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        addPost();
      }
    });
  }


const savedInput = localStorage.getItem("postInputValue");
if (savedInput) postInput.value = savedInput;


postInput.addEventListener("input", () => {
  localStorage.setItem("postInputValue", postInput.value);
});


if (postForm) {
  postForm.addEventListener("submit", () => {
    localStorage.removeItem("postInputValue");
  });
}


  
  loadPosts();
});


