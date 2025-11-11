const openCameraBtn = document.getElementById("openCamera");
const cameraContainer = document.getElementById("cameraContainer");
const video = document.getElementById("video");
const takePhotoBtn = document.getElementById("takePhoto");
const flipCameraBtn = document.getElementById("flipCamera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const photosContainer = document.getElementById("photosContainer");

let stream = null;
let photos = [];
let currentFacingMode = "environment"; // 'environment' para trasera, 'user' para frontal

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/pwa-camara/sw.js").then(
      function (registration) {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}



async function openCamera() {
  try {
    const constraints = {
      video: {
        facingMode: { ideal: currentFacingMode },
        width: { ideal: 320 },
        height: { ideal: 240 },
      },
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    cameraContainer.style.display = "flex";
    openCameraBtn.textContent = "Cámara Abierta";
    openCameraBtn.disabled = true;

    console.log("Cámara abierta exitosamente con modo:", currentFacingMode);
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
    alert("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
  }
}

function takePhoto() {
  if (!stream) {
    alert("Primero debes abrir la cámara");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageDataURL = canvas.toDataURL("image/png");

  const photoData = {
    id: Date.now(),
    dataURL: imageDataURL,
    timestamp: new Date().toLocaleString("es-ES"),
  };

  photos.push(photoData);
  displayPhotos();

  console.log(
    `Foto capturada #${photos.length}. Total de fotos: ${photos.length}`
  );
  console.log("Foto capturada en base64:", imageDataURL.length, "caracteres");
}

function displayPhotos() {
  photosContainer.innerHTML = "";

  if (photos.length === 0) {
    photosContainer.innerHTML =
      '<div class="empty-message">No hay fotos aún. ¡Toma tu primera foto!</div>';
    return;
  }

  photos
    .slice()
    .reverse()
    .forEach((photo, index) => {
      const photoItem = document.createElement("div");
      photoItem.className = "photo-item";

      const img = document.createElement("img");
      img.src = photo.dataURL;
      img.alt = `Foto ${photos.length - index}`;

      const info = document.createElement("div");
      info.className = "photo-info";
      info.textContent = `Foto #${photos.length - index} - ${photo.timestamp}`;

      photoItem.appendChild(img);
      photoItem.appendChild(info);
      photosContainer.appendChild(photoItem);
    });

  photosContainer.scrollTop = 0;
}

function closeCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
    video.srcObject = null;
    cameraContainer.style.display = "none";
    openCameraBtn.textContent = "Abrir Cámara";
    openCameraBtn.disabled = false;

    console.log("Cámara cerrada");
  }
}

async function flipCamera() {
  if (!stream) {
    alert("Primero debes abrir la cámara");
    return;
  }

  // Cambiar el modo de la cámara
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";

  // Cerrar la cámara actual
  stream.getTracks().forEach((track) => track.stop());

  // Abrir la cámara con el nuevo modo
  try {
    const constraints = {
      video: {
        facingMode: { ideal: currentFacingMode },
        width: { ideal: 320 },
        height: { ideal: 240 },
      },
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    console.log("Cámara volteada a modo:", currentFacingMode);
  } catch (error) {
    console.error("Error al voltear la cámara:", error);
    alert(
      "No se pudo cambiar la cámara. Puede que tu dispositivo no tenga múltiples cámaras."
    );

    // Intentar volver a la cámara anterior
    currentFacingMode =
      currentFacingMode === "environment" ? "user" : "environment";
    openCamera();
  }
}

openCameraBtn.addEventListener("click", openCamera);
takePhotoBtn.addEventListener("click", takePhoto);
flipCameraBtn.addEventListener("click", flipCamera);

window.addEventListener("beforeunload", () => {
  closeCamera();
});
