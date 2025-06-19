import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Initialize Three.js scene
let scene, camera, renderer, controls;

// Particle system
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random animation delay
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
    
    // Random size
    const size = Math.random() * 3 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random opacity
    particle.style.opacity = Math.random() * 0.5 + 0.3;
    
    particlesContainer.appendChild(particle);
  }
}

// Enhanced typing effect
function initTypingEffect() {
  const welcomeText = document.getElementById('welcome-text');
  const text = welcomeText.textContent;
  welcomeText.textContent = '';
  
  let i = 0;
  const typeWriter = () => {
    if (i < text.length) {
      welcomeText.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    }
  };
  
  // Start typing after a short delay
  setTimeout(typeWriter, 500);
}

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('home-section').appendChild(renderer.domElement);

    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    // Limit vertical rotation between 45° and 120°
    // controls.minPolarAngle = Math.PI / 4;
    //controls.maxPolarAngle = Math.PI / 1.5;

    // Limit horizontal rotation between -22.5° and 22.5°
    const initialAzimuth = controls.getAzimuthalAngle();
    //controls.minAzimuthAngle = initialAzimuth - Math.PI / 8;
    //controls.maxAzimuthAngle = initialAzimuth + Math.PI / 8;

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
    
    // Load living room
    loader.load(
        '/assets/living_room.glb',
        (gltf) => {
            const livingRoom = gltf.scene;
            livingRoom.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissive.set('#fdf6e3');
                    child.material.emissiveIntensity = 0;
                }
            });

            // Change size and angle of living room
            livingRoom.scale.set(0.35, 0.35, 0.35);
            livingRoom.rotation.x = 0.85;
            livingRoom.rotation.y = 0.10;

            scene.add(livingRoom);
            animate();
            
            // Add fade-in effect after the model is loaded
            setTimeout(() => {
                renderer.domElement.classList.add('visible');
            }, 100);
        },
        undefined,
        (error) => {
            console.error('Error loading living room:', error);
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

const aboutData = [
    {
        title: "University of Hawaii at Hilo",
        date: "2012-2016",
        description: "Communication B.A.",
    },
    {
        title: "Customer Services Host",
        date: "2016-2019",
        description: "Alola Moana Center",
    },
    {
        title: "App Academy",
        date: "2022-2023",
        description: "Software Engineer Program",
    },
    {
        title: "Hackathon Event",
        date: "2023",
        description: "Priyada Studio's Website",
    },
    {
        title: "Volunteer Software Engineer",
        date: "2023",
        description: "Democracy Lab",
    },
];

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  section.scrollIntoView({ behavior: 'smooth' });
}

window.scrollToSection = scrollToSection;

initThreeJS();

const sectionIds = ['home-section', 'about-section', 'work-section', 'contact-section'];

function scrollToNextSection() {
  // Find the section closest to the top
  let currentIdx = 0;
  for (let i = 0; i < sectionIds.length; i++) {
    const section = document.getElementById(sectionIds[i]);
    const rect = section.getBoundingClientRect();
    if (rect.top >= -10) { // Section is at or just above the top
      currentIdx = i;
      break;
    }
  }
  // Scroll to the next section if it exists
  if (currentIdx < sectionIds.length - 1) {
    const nextSection = document.getElementById(sectionIds[currentIdx + 1]);
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function scrollToPrevSection() {
  let currentIdx = 0;
  for (let i = 0; i < sectionIds.length; i++) {
    const section = document.getElementById(sectionIds[i]);
    const rect = section.getBoundingClientRect();
    if (rect.top >= -10) {
      currentIdx = i;
      break;
    }
  }
  if (currentIdx > 0) {
    const prevSection = document.getElementById(sectionIds[currentIdx - 1]);
    if (prevSection) {
      prevSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}


window.scrollToNextSection = scrollToNextSection;
window.scrollToPrevSection = scrollToPrevSection;

window.addEventListener('wheel', (e) => {
  if (e.deltaY > 0) {
    scrollToNextSection();
  } else if (e.deltaY < 0) {
    scrollToPrevSection();
  }
}, { passive: false });

// Music functionality
let isMusicPlaying = false;
const audioPlayer = document.getElementById('audio-player');
const musicButton = document.querySelector('.music-button');

window.toggleMusic = function() {
  if (isMusicPlaying) {
    audioPlayer.pause();
    musicButton.classList.remove('playing');
    musicButton.innerHTML = '<i class="fas fa-music fa-lg"></i>';
    isMusicPlaying = false;
  } else {
    audioPlayer.play().catch(error => {
      console.log('Audio play failed:', error);
      // Fallback: try to play on user interaction
      document.addEventListener('click', function playOnClick() {
        audioPlayer.play().then(() => {
          musicButton.classList.add('playing');
          musicButton.innerHTML = '<i class="fas fa-volume-mute fa-lg"></i>';
          isMusicPlaying = true;
        }).catch(err => console.log('Audio play still failed:', err));
        document.removeEventListener('click', playOnClick);
      }, { once: true });
    });
    
    if (audioPlayer.readyState >= 2) { // HAVE_CURRENT_DATA or higher
      musicButton.classList.add('playing');
      musicButton.innerHTML = '<i class="fas fa-volume-mute fa-lg"></i>';
      isMusicPlaying = true;
    }
  }
};

// Handle audio events
audioPlayer.addEventListener('ended', function() {
  if (isMusicPlaying) {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  }
});

audioPlayer.addEventListener('error', function() {
  console.log('Audio error occurred');
  musicButton.classList.remove('playing');
  isMusicPlaying = false;
});

// Initialize home page enhancements
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  initTypingEffect();
});
