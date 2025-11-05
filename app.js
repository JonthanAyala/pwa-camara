// ⚙️ Paso 2: Implementación de la Lógica de la Cámara en app.js

// 2.1. 🎣 Referencias y Variables Globales
// Referencias a elementos del DOM
const openCameraBtn = document.getElementById("openCamera");
const cameraContainer = document.getElementById("cameraContainer");
const video = document.getElementById("video");
const takePhotoBtn = document.getElementById("takePhoto");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); // Contexto 2D para dibujar en el Canvas
const photosContainer = document.getElementById("photosContainer");

let stream = null; // Variable para almacenar el MediaStream de la cámara
let photos = []; // Array para almacenar todas las fotos capturadas

// 2.2. 📹 Función openCamera(): Activación de la Cámara
async function openCamera() {
  try {
    // 1. Definición de Restricciones (Constraints)
    const constraints = {
      video: {
        facingMode: { ideal: "environment" }, // Solicita la cámara trasera
        width: { ideal: 320 },
        height: { ideal: 240 },
      },
    };

    // 2. Obtener el Stream de Medios
    stream = await navigator.mediaDevices.getUserMedia(constraints);

    // 3. Asignar el Stream al Elemento <video>
    video.srcObject = stream;

    // 4. Actualización de la UI
    cameraContainer.style.display = "flex";
    openCameraBtn.textContent = "Cámara Abierta";
    openCameraBtn.disabled = true;

    console.log("Cámara abierta exitosamente");
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
    alert("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
  }
}

// 2.3. 📸 Función takePhoto(): Captura y Procesamiento
function takePhoto() {
  if (!stream) {
    alert("Primero debes abrir la cámara");
    return;
  }

  // 1. Ajustar el tamaño del canvas al tamaño del video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 2. Dibujar el Frame de Video en el Canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 3. Conversión a Data URL
  const imageDataURL = canvas.toDataURL("image/png");

  // 4. Guardar la foto en el array con información adicional
  const photoData = {
    id: Date.now(),
    dataURL: imageDataURL,
    timestamp: new Date().toLocaleString("es-ES"),
  };

  photos.push(photoData);

  // 5. Actualizar la galería de fotos
  displayPhotos();

  // 6. (Opcional) Visualización y Depuración
  console.log(
    `Foto capturada #${photos.length}. Total de fotos: ${photos.length}`
  );
}

// 📷 Función para mostrar todas las fotos guardadas
function displayPhotos() {
  // Limpiar el contenedor
  photosContainer.innerHTML = "";

  if (photos.length === 0) {
    photosContainer.innerHTML =
      '<div class="empty-message">No hay fotos aún. ¡Toma tu primera foto!</div>';
    return;
  }

  // Mostrar las fotos en orden inverso (más reciente primero)
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

  // Scroll automático al inicio (foto más reciente)
  photosContainer.scrollTop = 0;
}

// 2.4. 🛑 Función closeCamera(): Liberación de Recursos
function closeCamera() {
  if (stream) {
    // Detener todos los tracks del stream (video, audio, etc.)
    stream.getTracks().forEach((track) => track.stop());
    stream = null; // Limpiar la referencia

    // Limpiar y ocultar UI
    video.srcObject = null;
    cameraContainer.style.display = "none";

    // Restaurar el botón 'Abrir Cámara'
    openCameraBtn.textContent = "Abrir Cámara";
    openCameraBtn.disabled = false;

    console.log("Cámara cerrada");
  }
}

// 2.5. 🖱️ Event Listeners y Limpieza
// Event listeners para la interacción del usuario
openCameraBtn.addEventListener("click", openCamera);
takePhotoBtn.addEventListener("click", takePhoto);

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener("beforeunload", () => {
  closeCamera();
});
