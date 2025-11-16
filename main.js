import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import getI18n from "./i18n";

// Initialize Three.js scene
let scene, camera, renderer, controls;

function initThreeJS() {
  // Show loading indicator
  showLoadingIndicator();
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 5);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.width = '100vw';
  renderer.domElement.style.height = '100vh';
  document.getElementById("home-section").appendChild(renderer.domElement);

  // Add orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;

  const initialAzimuth = controls.getAzimuthalAngle();

  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;
  window.controls = controls;

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const pointLight1 = new THREE.PointLight(0xffffff, 1);
  pointLight1.position.set(2, 2, 2);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 1);
  pointLight2.position.set(-2, 2, -2);
  scene.add(pointLight2);

  // Load both models
  const loader = new GLTFLoader();

  // Load living room from S3
  loader.load(
    "https://seng-portfolio-bucket.s3.us-west-1.amazonaws.com/living_room.glb",
    (gltf) => {
      const livingRoom = gltf.scene;
      livingRoom.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissive.set("#fdf6e3");
          child.material.emissiveIntensity = 0;
        }
      });

      // Change size and angle of living room
      livingRoom.scale.set(0.35, 0.35, 0.35);
      livingRoom.rotation.x = 0.85;
      livingRoom.rotation.y = 0.1;

      scene.add(livingRoom);
      animate();

      // Add fade-in effect after the model is loaded
      setTimeout(() => {
        renderer.domElement.classList.add("visible");
        hideLoadingIndicator();
      }, 100);
    },
    undefined,
    (error) => {
      console.error("Error loading living room:", error);
    }
  );
}

// Animation loop
function animate() {
  if (!renderer) return;
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

window.scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  section.scrollIntoView({ behavior: "smooth" });
};

initThreeJS();

// Particle system
function createParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 100;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random position
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";

    // Random animation delay
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.animationDuration = Math.random() * 3 + 4 + "s";

    // Random size
    const size = Math.random() * 3 + 2;
    particle.style.width = size + "px";
    particle.style.height = size + "px";

    // Random opacity
    particle.style.opacity = Math.random() * 0.5 + 0.3;

    particlesContainer.appendChild(particle);
  }
}

// Track typing animation state
let isTyping = false;
let typingTimeout = null;

// Enable/disable language toggle button
function setLanguageButtonEnabled(enabled) {
  const languageButton = document.getElementById('languageToggle');
  if (languageButton) {
    languageButton.disabled = !enabled;
    languageButton.style.opacity = enabled ? '1' : '0.5';
    languageButton.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }
}

// Enhanced typing effect
async function initTypingEffect() {
  const welcomeText = document.getElementById("welcome-text");
  if (!welcomeText) return;
  
  // Clear any existing typing animation
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
  
  // Clear the text FIRST to prevent flash of text before animation starts
  welcomeText.textContent = "";
  
  // Get the translated text from i18n
  let text = '';
  try {
    // Get i18n instance (will wait for initialization if needed)
    const i18n = await getI18n();
    text = i18n.t('home.welcome');
  } catch (error) {
    console.warn('Failed to get translation:', error);
    text = '';
  }

  // Disable language button during typing animation
  isTyping = true;
  setLanguageButtonEnabled(false);

  let i = 0;
  const typeWriter = () => {
    if (i < text.length) {
      welcomeText.textContent += text.charAt(i);
      i++;
      typingTimeout = setTimeout(typeWriter, 100);
    } else {
      // Animation completed, enable language button
      isTyping = false;
      setLanguageButtonEnabled(true);
      typingTimeout = null;
    }
  };

  // Start typing animation after a short delay
  typingTimeout = setTimeout(typeWriter, 500);
}

// Language toggle function
window.toggleLanguage = async () => {
  // Prevent language toggle during typing animation
  if (isTyping) {
    return;
  }
  
  // Get i18n instance (will wait for initialization if needed)
  let i18n;
  try {
    i18n = await getI18n();
  } catch (error) {
    console.warn("i18n not initialized yet:", error);
    return;
  }
  
  const welcomeText = document.getElementById("welcome-text");
  
  // Clear the text IMMEDIATELY to prevent flash before animation
  if (welcomeText) {
    welcomeText.textContent = "";
  }
  
  const currentLang = i18n.getCurrentLanguage();
  const newLang = currentLang === 'en' ? 'zh-TW' : 'en';
  
  // Disable button during language change
  setLanguageButtonEnabled(false);
  
  await i18n.changeLanguage(newLang);
  
  // i18n.updatePage() now skips welcome-text, so it should still be empty
  // Ensure it's empty before starting animation
  if (welcomeText) {
    welcomeText.textContent = "";
  }
  
  // Wait a bit for i18n to update the DOM, then re-initialize typing effect
  // The button will be re-enabled when typing animation completes
  // Use requestAnimationFrame to ensure DOM is updated
  requestAnimationFrame(() => {
    setTimeout(() => {
      initTypingEffect();
    }, 50);
  });
};

// Music functionality
let isMusicPlaying = false;
const audioPlayer = document.getElementById("audio-player");
const musicButton = document.querySelector(".music-button");

window.toggleMusic = () => {
  if (isMusicPlaying) {
    audioPlayer.pause();
    musicButton.classList.remove("playing");
    musicButton.innerHTML = '<i class="fas fa-music fa-lg"></i>';
    isMusicPlaying = false;
  } else {
    audioPlayer.play().catch((error) => {
      console.log("Audio play failed:", error);
      // Fallback: try to play on user interaction
      document.addEventListener(
        "click",
        function playOnClick() {
          audioPlayer
            .play()
            .then(() => {
              musicButton.classList.add("playing");
              musicButton.innerHTML =
                '<i class="fas fa-volume-mute fa-lg"></i>';
              isMusicPlaying = true;
            })
            .catch((err) => console.log("Audio play still failed:", err));
          document.removeEventListener("click", playOnClick);
        },
        { once: true }
      );
    });

    if (audioPlayer.readyState >= 2) {
      // HAVE_CURRENT_DATA or higher
      musicButton.classList.add("playing");
      musicButton.innerHTML = '<i class="fas fa-volume-mute fa-lg"></i>';
      isMusicPlaying = true;
    }
  }
};

// Handle audio events
audioPlayer.addEventListener("ended", function () {
  if (isMusicPlaying) {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  }
});

audioPlayer.addEventListener("error", function () {
  console.log("Audio error occurred");
  musicButton.classList.remove("playing");
  isMusicPlaying = false;
});

// Skill category state management
let currentSkillCategory = "frontend"; // default category
let currentDetailCategory = "background"; // default detail category

window.showSkills = (category) => {
  // Update current category
  currentSkillCategory = category;

  // Hide all skill categories
  const skillCategories = document.querySelectorAll(".skill-category");
  skillCategories.forEach((category) => {
    category.style.display = "none";
  });

  // Show the selected category
  const selectedCategory = document.querySelector(
    `.skill-category[data-category="${category}"]`
  );
  if (selectedCategory) {
    selectedCategory.style.display = "block";
  }

  // Update button states
  const categoryButtons = document.querySelectorAll(".skill-category-button");
  categoryButtons.forEach((button) => {
    button.classList.remove("active");
  });

  // Add active class to clicked button
  const activeButton = document.querySelector(
    `[onclick="showSkills('${category}')"]`
  );
  if (activeButton) {
    activeButton.classList.add("active");
  }
};

window.showDetails = (category) => {
  // Update current category
  currentDetailCategory = category;

  // Hide all detail categories
  const detailCategories = document.querySelectorAll(".detail-category");
  detailCategories.forEach((category) => {
    category.style.display = "none";
  });

  // Show the selected category
  const selectedCategory = document.querySelector(
    `.detail-category[data-category="${category}"]`
  );
  if (selectedCategory) {
    selectedCategory.style.display = "block";
  }

  // Update button states
  const categoryButtons = document.querySelectorAll(".detail-category-button");
  categoryButtons.forEach((button) => {
    button.classList.remove("active");
  });

  // Add active class to clicked button
  const activeButton = document.querySelector(
    `[onclick="showDetails('${category}')"]`
  );
  if (activeButton) {
    activeButton.classList.add("active");
  }
};

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  createParticles();
  
  // Wait for i18n to initialize and complete translation
  await getI18n();
  
  // Small delay to ensure DOM is updated with translations
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await initTypingEffect();

  // Initialize skills with default category
  showSkills(currentSkillCategory);

  // Initialize details with default category
  showDetails(currentDetailCategory);
  
  // Enable language button after initialization (if not typing)
  // Note: typing effect will be triggered by toggleLanguage function when language changes
  if (!isTyping) {
    setLanguageButtonEnabled(true);
  }
});

const form = document.querySelector("form");

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitButton = e.target.querySelector(".submit-btn");
  const sendMessageText = submitButton.innerHTML;
  
  // Get i18n instance for translations
  let i18n;
  try {
    i18n = await getI18n();
  } catch (error) {
    console.warn('i18n not available:', error);
    i18n = null;
  }
  
  const sendingText = i18n ? i18n.t('contact.sending') : 'Sending...';
  const sendingHtml = `<i class="fas fa-spinner fa-spin"></i> ${sendingText}`;

  submitButton.disabled = true;
  submitButton.innerHTML = sendingHtml;

  const formData = new FormData(e.target);
  const formValues = Object.fromEntries(formData);

  try {
    const response = await fetch(
      "https://kdgqg3w87j.execute-api.us-west-1.amazonaws.com/Portfolio/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues?.email,
          phone: formValues?.phone,
          message: formValues.message,
        }),
      }
    );

    if (response.ok) {
      console.log("Message sent successfully!");
      e.target.reset();
      const successMsg = i18n ? i18n.t('contact.successMessage') : "Your message has been sent successfully!, I will get back to you as soon as possible.";
      alert(successMsg);
    } else {
      console.error(
        "Failed to send message:",
        response.status,
        response.statusText
      );
      const errorMsg = i18n ? i18n.t('contact.errorMessage') : "Failed to send message. Please try again.";
      alert(errorMsg);
    }
  } catch (error) {
    const errorGeneralMsg = i18n ? i18n.t('contact.errorGeneral') : "Error sending message. Please try again.";
    alert(errorGeneralMsg);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = sendMessageText;
  }
});

/* Loading Indicator */
function showLoadingIndicator() {
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "flex";
}

function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.style.display = "none";
}
