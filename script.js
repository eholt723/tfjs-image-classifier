let model;
const statusEl = document.getElementById("status");
const fileInput = document.getElementById("file");
const dropzone = document.getElementById("dropzone");
const previewWrap = document.getElementById("previewWrap");
const previewImg = document.getElementById("preview");
const resultsCard = document.getElementById("results");
const predBody = document.getElementById("predBody");

async function initModel() {
  try {
    
    model = await mobilenet.load(); 
    statusEl.textContent = "Model ready. Choose or drop an image.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to load the model. Check your network.";
  }
}

function humanPct(p) {
  return (p * 100).toFixed(2) + "%";
}

async function classify(imgEl) {
  if (!model) return;
  statusEl.textContent = "Classifying…";
  predBody.innerHTML = "";
  resultsCard.hidden = true;

  const preds = await model.classify(imgEl, 5); 
  preds.forEach(p => {
    const tr = document.createElement("tr");
    const tdLabel = document.createElement("td");
    const tdProb = document.createElement("td");
    tdLabel.textContent = p.className;
    tdProb.textContent = humanPct(p.probability);
    tr.appendChild(tdLabel);
    tr.appendChild(tdProb);
    predBody.appendChild(tr);
  });

  resultsCard.hidden = false;
  statusEl.textContent = "Done.";
}

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    statusEl.textContent = "Please choose an image file.";
    return;
  }
  const url = URL.createObjectURL(file);
  previewImg.onload = () => {
    URL.revokeObjectURL(url);
    classify(previewImg);
  };
  previewImg.src = url;
  previewWrap.hidden = false;
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  handleFile(file);
});

// Drag & drop
["dragenter","dragover"].forEach(evt =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("hover");
  })
);
["dragleave","drop"].forEach(evt =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    if (evt === "drop") {
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    }
    dropzone.classList.remove("hover");
  })
);


dropzone.addEventListener("click", () => fileInput.click());

// Kick things off
initModel();
