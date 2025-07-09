// Stores which slot has been filled with which team ID
const filled = {};

// Game structure: each team/image ID maps to the winner slot and opponent ID
const matchups = {
  // === ROUND 1 ===
  g1a: { winnerSlot: "g4b", opponent: "g1b" },
  g1b: { winnerSlot: "g4b", opponent: "g1a" },

  g2a: { winnerSlot: "g5b", opponent: "g2b" },
  g2b: { winnerSlot: "g5b", opponent: "g2a" },

  // === ROUND 2 ===
  g3a: { winnerSlot: "g7a", opponent: "g3b" },
  g3b: { winnerSlot: "g7a", opponent: "g3a" },

  g4a: { winnerSlot: "g7b", opponent: "g4b" },
  g4b: { winnerSlot: "g7b", opponent: "g4a" },

  g5a: { winnerSlot: "g8b", opponent: "g5b" },
  g5b: { winnerSlot: "g8b", opponent: "g5a" },

  g6a: { winnerSlot: "g8a", opponent: "g6b" },
  g6b: { winnerSlot: "g8a", opponent: "g6a" },

  // === SEMIFINALS ===
  g7a: { winnerSlot: "g9a", opponent: "g7b" },
  g7b: { winnerSlot: "g9a", opponent: "g7a" },

  g8a: { winnerSlot: "g9b", opponent: "g8b" },
  g8b: { winnerSlot: "g9b", opponent: "g8a" },

  // === CHAMPIONSHIP ===
  g9a: { winnerSlot: "g9", opponent: "g9b" },
  g9b: { winnerSlot: "g9", opponent: "g9a" }
};

// Handles the logic when a team is clicked
function handleClick(teamId, src) {
  const match = matchups[teamId];
  if (!match) return;

  const winnerSlot = document.getElementById(match.winnerSlot);
  if (!winnerSlot) return;

  // Prevent overriding a slot with another team
  if (filled[match.winnerSlot] && filled[match.winnerSlot] !== teamId) return;

  // Fill in winner slot with selected team's logo
  winnerSlot.src = src;
  filled[match.winnerSlot] = teamId;
  winnerSlot.classList.add("winner-glow", "slam");

  // Make the winner slot clickable in future rounds
  registerClickForSlot(match.winnerSlot, teamId, src);

  // If this is the championship game
  if (match.winnerSlot === "g9") {
    winnerSlot.classList.add("champion");
    confetti({
      particleCount: 500,
      spread: 160,
      startVelocity: 60,
      origin: { y: 0.6 }
    });
  }
}

// Makes the next-round slot clickable with same team
function registerClickForSlot(slotId, teamId, src) {
  const el = document.getElementById(slotId);
  if (!el) return;

  el.addEventListener("click", () => {
    const match = matchups[slotId];
    if (!match || (filled[match.winnerSlot] && filled[match.winnerSlot] !== teamId)) return;

    const winnerEl = document.getElementById(match.winnerSlot);
    if (winnerEl) {
      winnerEl.src = src;
      filled[match.winnerSlot] = teamId;
      winnerEl.classList.add("winner-glow", "slam");

      registerClickForSlot(match.winnerSlot, teamId, src);

      if (match.winnerSlot === "g9") {
        winnerEl.classList.add("champion");
        confetti({
          particleCount: 500,
          spread: 160,
          startVelocity: 60,
          origin: { y: 0.6 }
        });
      }
    }
  });
}

// Adds click listeners to all initial team logos
function registerAllClickEvents() {
  Object.keys(matchups).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => handleClick(id, el.src));
    }
  });
}

// Clears all logos from generated slots, keeping original logos untouched
function resetBracket() {
  document.querySelectorAll(".team").forEach(el => {
    if (!el.src.includes("logos/")) {
      el.src = "";
      el.classList.remove("winner-glow", "champion", "slam");
    }
  });
  Object.keys(filled).forEach(k => filled[k] = false);
}

// Ensure everything runs after DOM loads
document.addEventListener("DOMContentLoaded", registerAllClickEvents);

function enableEditMode() {
  const container = document.querySelector('.bracket-container');
  const targets = document.querySelectorAll('.team');

  targets.forEach(el => {
    el.style.pointerEvents = 'auto';
    el.style.border = '1px dashed red';
    el.draggable = true;
    el.style.position = 'absolute'; // Required for drag positioning

    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', null);
      el._dragStartX = e.clientX;
      el._dragStartY = e.clientY;
    });

    el.addEventListener('dragend', e => {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      // New position is element's center relative to container
      const logoHalfWidth = elRect.width / 2;
      const logoHalfHeight = elRect.height / 2;

      const newCenterX = e.clientX - containerRect.left;
      const newCenterY = e.clientY - containerRect.top;

      const leftPercent = ((newCenterX - logoHalfWidth) / containerRect.width) * 100;
      const topPercent = ((newCenterY - logoHalfHeight) / containerRect.height) * 100;

      el.style.left = `${leftPercent.toFixed(2)}%`;
      el.style.top = `${topPercent.toFixed(2)}%`;

      console.log(`"${el.id}": top: ${topPercent.toFixed(2)}%; left: ${leftPercent.toFixed(2)}%;`);
    });
  });
}

function enableEditMode() {
  const container = document.querySelector('.bracket-container');
  const targets = document.querySelectorAll('.team');

  targets.forEach(el => {
    el.style.position = 'absolute';
    el.style.cursor = 'move';
    el.style.border = '1px dashed red';

    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const shiftX = e.clientX - el.getBoundingClientRect().left;
      const shiftY = e.clientY - el.getBoundingClientRect().top;

      function moveAt(pageX, pageY) {
        const bounds = container.getBoundingClientRect();
        const relX = ((pageX - bounds.left - shiftX) / bounds.width) * 100;
        const relY = ((pageY - bounds.top - shiftY) / bounds.height) * 100;

        el.style.left = `${relX.toFixed(2)}%`;
        el.style.top = `${relY.toFixed(2)}%`;
      }

      function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
      }

      document.addEventListener('mousemove', onMouseMove);

      document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', onMouseMove);
        const left = el.style.left;
        const top = el.style.top;
        console.log(`"${el.id}": top: ${top}; left: ${left};`);
      }, { once: true });
    });
  });

  console.log("✅ Edit mode enabled — click and drag logos, then copy console positions.");
}


// Initialize everything on load
registerAllClickEvents();

