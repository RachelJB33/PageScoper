// ======================
// DEBUG
// Confirm JS is connected
console.log("PageScoper is connected");
// End of DEBUG
// ======================



// =====================
// DOM / Element Selectors
// Intro animation elements
const introScreen = document.querySelector("#introScreen");
const introLogo = document.querySelector("#introLogo");
const appShell = document.querySelector("#appShell");

// Get the form element
const form = document.querySelector("#projectForm");

// Get the project list container where project cards will be displayed
const projectList = document.querySelector("#projectList");

const projectsHeading = document.querySelector("#projectsHeading");
// Get the project count number inside the heading
const projectCount = document.querySelector("#projectCount");

// Get the status filter dropdown
const statusFilter = document.querySelector("#statusFilter");
// Select the search input from the HTML
const searchInput = document.querySelector("#searchInput");

// Get the modal (used for all modal actions)
const actionModal = document.querySelector("#actionModal");
// Get the modal buttons
const cancelActionBtn = document.querySelector("#cancelActionBtn");
const confirmActionBtn = document.querySelector("#confirmActionBtn");
// Get modal text elements so JS can change them
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");

// Get the edit modal
const editModal = document.querySelector("#editModal");
// Get the edit form inside the edit modal
const editProjectForm = document.querySelector("#editProjectForm");
// Get the cancel button inside the edit modal
const cancelEditBtn = document.querySelector("#cancelEditBtn");

// Get each edit form input
const editClientName = document.querySelector("#editClientName");
const editProjectName = document.querySelector("#editProjectName");
const editProjectType = document.querySelector("#editProjectType");
const editPageCount = document.querySelector("#editPageCount");
const editProjectStatus = document.querySelector("#editProjectStatus");

const notesModal = document.querySelector("#notesModal");
const notesForm = document.querySelector("#notesForm");
const projectNotes = document.querySelector("#projectNotes");
const cancelNotesBtn = document.querySelector("#cancelNotesBtn");
// End of DOM / Element Selectors
// =====================


// =====================
// App State
// Store which project the modal is acting on
let projectToActOn = null;

// Store what action the modal should perform
// ("trash", "restore", "deleteForever")
let modalAction = null;

// Store which project is currently being edited
let projectToEdit = null;

// Store which project is currently having notes edited
let projectToNote = null;

// Load saved projects from localStorage, or start with an empty array
let projects = JSON.parse(localStorage.getItem("projects")) || [];
// End of App State
// =====================


// =====================
// Helper Functions
function getStatusBadgeClass(status) {
  if (status === "Inquiry") {
    return "bg-yellow-500/20 text-white border-none";
  }

  if (status === "Planning") {
    return "bg-blue-500/20 text-white border-none";
  }

  if (status === "Design") {
    return "bg-purple-500/20 text-white border-none";
  }

  if (status === "Build") {
    return "bg-pink-500/20 text-white border-none";
  }

  if (status === "Launched") {
    return "bg-green-500/20 text-white border-none";
  }

  return "bg-slate-500/20 text-white border-none";
}
// End of Helper Functions
// =====================


// =====================
// Global Event Listeners
// When the form is submitted...
form.addEventListener("submit", function(event) {

  // Stop page from refreshing
  event.preventDefault();

  // Get user input from form field
  const clientName = document.querySelector("#clientName").value;
  const projectName = document.querySelector("#projectName").value;
  const projectType = document.querySelector("#projectType").value;
  const pageCount = document.querySelector("#pageCount").value;
  const projectStatus = document.querySelector("#projectStatus").value;

  // Group all form values into one project object
  const project = {
    clientName: clientName,
    projectName: projectName,
    projectType: projectType,
    pageCount: pageCount,
    status: projectStatus, 
    isDeleted: false,

    // Store notes for this project
    // Starts empty until the user adds notes
    notes: ""
  };

  // Add the new project object to the projects array
  // .push() means "add this item to the end of the list"
  projects.push(project);

  // Save updated projects array to localStorage
  localStorage.setItem("projects", JSON.stringify(projects));

  // Log the entire projects array
  // This lets you see ALL projects stored so far (not just one)
  console.log(projects);

  // Update the screen so the new project card appears
  renderProjects();

  // Reset the form fields after submission
  form.reset();

});

// When status filter changes, update the displayed projects badge
statusFilter.addEventListener ("change", function() {
  renderProjects();
});

// Re-render projects when the user types in the search input
searchInput.addEventListener("input", function() {
  renderProjects();
});

// Close modal without deleting
cancelActionBtn.addEventListener("click", function() {

  projectToActOn = null;
  modalAction = null;
  actionModal.close();

});

// Confirm the current modal action
confirmActionBtn.addEventListener("click", function() {

  // If no project or action is selected, stop here
  if (!projectToActOn || !modalAction) return;

  // Find the selected project in the original projects array
  const realIndex = projects.indexOf(projectToActOn);

  // If the project is not found, stop here
  if (realIndex === -1) return;

  if (modalAction === "trash") {
    // Move active project to Trash
    projects[realIndex].isDeleted = true;
  }

  if (modalAction === "restore") {
    // Restore trashed project back to Active Projects
    projects[realIndex].isDeleted = false;
  }

  if (modalAction === "deleteForever") {
    // Permanently remove project from the array
    projects.splice(realIndex, 1);
  }

  // Save updated projects after deleting
  localStorage.setItem("projects", JSON.stringify(projects));

  // Clear the modal state
  projectToActOn = null;
  modalAction = null;

  // Close the modal and update UI
  actionModal.close();
  renderProjects();

});

// When the edit form is submitted...
editProjectForm.addEventListener("submit", function(event) {

  // Stop the page from refreshing
  event.preventDefault();

  // If no project is selected, stop the function
  if (!projectToEdit) return;

  // Find the selected project in the original projects array
  const realIndex = projects.indexOf(projectToEdit);

  // If the project cannot be found, stop the function
  if (realIndex === -1) return;

  // Update the project with the new edit form values
  projects[realIndex].clientName = editClientName.value;
  projects[realIndex].projectName = editProjectName.value;
  projects[realIndex].projectType = editProjectType.value;
  projects[realIndex].pageCount = editPageCount.value;
  projects[realIndex].status = editProjectStatus.value;

  // Save the updated projects array to localStorage
  localStorage.setItem("projects", JSON.stringify(projects));

  // Clear the selected project
  projectToEdit = null;
  modalAction = null;

  // Close the edit modal and update UI
  editModal.close();
  renderProjects();

});

// Close the edit modal without saving changes
cancelEditBtn.addEventListener("click", function() {

  // Clear the selected project
  projectToEdit = null;

  // Close the edit modal
  editModal.close();

});

// When the notes form is submitted...
notesForm.addEventListener("submit", function(event) {

  // Stop the page from refreshing
  event.preventDefault();

  // If no project is selected for notes, stop the function
  if (!projectToNote) return;

  // Find the selected project in the original projects array
  const realIndex = projects.indexOf(projectToNote);

  // If the project cannot be found, stop the function
  if (realIndex === -1) return;

  // Save the textarea value into the project's notes property
  projects[realIndex].notes = projectNotes.value;

  // Save the updated projects array to localStorage
  localStorage.setItem("projects", JSON.stringify(projects));

  // Clear the selected notes project
  projectToNote = null;

  // Close the notes modal
  notesModal.close();

  // Re-render projects so the app stays updated
  renderProjects();

});

// Close the notes modal without saving changes
cancelNotesBtn.addEventListener("click", function() {

  // Clear the selected notes project
  projectToNote = null;

  // Close the notes modal
  notesModal.close();

});
// End of Global Event Listeners
// =====================

  
// =====================
// Render Projects
// Function to display all projects on the page
function renderProjects() {

  // Clear existing project cards (prevents duplicates)
  projectList.innerHTML = "";

 // If there are no projects saved at all, show the main onboarding empty state.
// This is what a brand-new user sees before adding their first project.
if (projects.length === 0) {

  projectList.innerHTML = `
    <div class="card bg-slate-800 border border-slate-700 rounded-2xl sm:col-span-2">
      <div class="card-body items-center text-center p-7">

        <p class="text-3xl">✦</p>

        <h3 class="font-semibold text-base text-slate-100">
          Start planning your first project.
        </h3>

        <p class="max-w-md text-sm leading-relaxed text-slate-400">
          Use the form to add a website project, track its status, save notes, and keep client details organized in one place.
        </p>

        <p class="text-xs text-slate-500">
          Try adding a project like “Portfolio Website” or “Local Business Redesign.”
        </p>

      </div>
    </div>
  `;

  // Stop the function here so it does not try to render project cards.
  return;
}

  // Get selected filter value
  const selectedStatus = statusFilter.value;

  // This variable will hold the final list of projects we want to display
  let filteredProjects;

  // Check what the user selected in the dropdown
  if (selectedStatus === "Trash") {

    // If user selects "Trash":
    // → show ONLY projects that have been deleted
    filteredProjects = projects.filter(function(project) {
  
      // Keep this project ONLY if isDeleted is true
      return project.isDeleted === true;

    });

  } else if ( selectedStatus === "Active") {

    // If user selects "Active":
    // → show ALL projects that are NOT deleted
    filteredProjects = projects.filter(function(project) {

      // Keep this project if it is NOT deleted
      return project.isDeleted !== true;
    });

  } else {

    // If user selects a specific status like "Planning" or "Design":
    // → show only projects that:
    //    1. are NOT deleted
    //    2. match the selected status
    filteredProjects = projects.filter(function(project) {

      return project.isDeleted !== true && project.status === selectedStatus;
    });
  }

  // Search Input for customer & project name logic
  // Get the text currently inside the search bar
  const searchTerm = searchInput.value.toLowerCase().trim();

  // Filter projects based on search text
  filteredProjects = filteredProjects.filter(function(project) {

    // Convert project name to lowercase
    const projectName = project.projectName.toLowerCase();
    // Convert client name to lowercase
    const clientName = project.clientName.toLowerCase();
    
    // Return projects that match either:
    // - the project name
    // - OR the client name
    return (
      projectName.includes(searchTerm) ||
      clientName.includes(searchTerm)
    );

  });



  // Count how many projects are currently being shown after filtering
  // Get how many projects are currently visible after filtering
  const visibleProjectCount = filteredProjects.length;

  // Set the number dynamically
  projectCount.textContent = `(${visibleProjectCount})`;

  // If there ARE projects saved, but none match the current filter,
  // show a filter-specific empty state instead of leaving the dashboard blank.
  if (filteredProjects.length === 0) {

  // Get the current search text so we can tell whether the user is searching
  const hasSearchTerm = searchTerm.length > 0;

  // Start with a general default message
  let emptyTitle = "No projects found.";
  let emptyMessage = "Try changing your search or status filter.";

  // If the user searched for something and got no matches
  if (hasSearchTerm) {
    emptyTitle = "No matching projects.";
    emptyMessage = "Try a different project name or client name.";
  }

  // If the user is viewing Trash and there are no deleted projects
  if (selectedStatus === "Trash" && !hasSearchTerm) {
    emptyTitle = "Trash is empty.";
    emptyMessage = "Deleted projects will appear here.";
  }

  // If the user is filtering by a specific status and there are no projects there
  if (
    !hasSearchTerm &&
    (
      selectedStatus === "Inquiry" ||
      selectedStatus === "Planning" ||
      selectedStatus === "Design" ||
      selectedStatus === "Build" ||
      selectedStatus === "Launched"
    )
  ) {
    emptyTitle = `No ${selectedStatus} projects.`;
    emptyMessage = "Projects with this status will appear here.";
  }

  // Insert the empty state card into the project list area
  projectList.innerHTML = `
    <div class="card bg-slate-800 border border-slate-700 rounded-2xl sm:col-span-2">
      <div class="card-body items-center text-center p-6">
        <p class="text-2xl">⌕</p>

        <h3 class="font-semibold text-base text-slate-100">
          ${emptyTitle}
        </h3>

        <p class="max-w-sm text-sm text-slate-400">
          ${emptyMessage}
        </p>
      </div>
    </div>
  `;

  // Stop the function so it does not try to loop through an empty list
  return;
}
  
  // Loop through filtered projects, not all projects
  filteredProjects.forEach(function(project, index) {

    // Create a new HTML element for the project card
    const projectCard = document.createElement("article");

    // Add DaisyUI + Tailwind styling classes to the card
    projectCard.className = "card bg-slate-800 border border-slate-700 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200";

    // Insert project data into the card
    projectCard.innerHTML = `

    <div class="card-body p-5 gap-3">
      <div class="flex items-start justify-between gap-4">
        <h3 class="card-title text-base font-semibold leading-tight text-slate-100">${project.projectName}</h3>
        <span class="badge ${getStatusBadgeClass(project.status)}">${project.status}</span>
      </div>

      <div class="space-y-1.5 text-sm leading-relaxed">
        <p>
          <span class="text-slate-400">Client:</span>
          <span class="text-slate-100">${project.clientName}</span>
        </p>

        <p>
          <span class="text-slate-400">Type:</span>
          <span class="text-slate-100">${project.projectType}</span>
        </p>

        <p>
          <span class="text-slate-400">Pages:</span>
          <span class="text-slate-100">${project.pageCount}</span>
        </p>
      </div>

      

      ${project.isDeleted === true
        ? `
          <div class="flex flex-col gap-2 sm:flex-row">
            <button class="btn btn-sm !shadow-none bg-emerald-800 hover:bg-emerald-700 text-slate-100 border border-emerald-700 restore-btn">Restore</button>
            <button class="btn btn-sm !bg-transparent !border-none !shadow-none !hover:bg-slate-700 text-slate-400 hover:text-red-400 permanent-delete-btn">Delete Forever</button>
          </div>
        `
        : `
  <div class="flex items-center justify-between pt-3">

    <div class="flex items-center gap-3">
      <button class="btn btn-sm !shadow-none bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-500/40 edit-btn transition-all duration-150">
        Edit
      </button>

      <button class="btn btn-sm !bg-transparent !border-none !shadow-none !hover:bg-slate-700 text-slate-400 hover:text-red-400 delete-btn">
        Delete
      </button>
    </div>

    <button class="text-sm text-slate-400 hover:text-indigo-300 transition-all duration-150 notes-btn">
      Notes →
    </button>

  </div>
  `
      }

    </div>
    `;

    const deleteBtn = projectCard.querySelector(".delete-btn");
    const restoreBtn = projectCard.querySelector(".restore-btn");
    const permanentDeleteBtn = projectCard.querySelector(".permanent-delete-btn");
    const editBtn = projectCard.querySelector(".edit-btn");
    // Get the notes button from this specific project card
    const notesBtn = projectCard.querySelector(".notes-btn");

    // Active project: edit project details
    if (deleteBtn) {
      editBtn.addEventListener("click", function() {

        // Save which project we are editing
        projectToEdit = project;

        // Fill the edit form with the project's current information
        editClientName.value = project.clientName;
        editProjectName.value = project.projectName;
        editProjectType.value = project.projectType;
        editPageCount.value = project.pageCount;
        editProjectStatus.value = project.status;
        

        // Open the edit modal
        editModal.showModal();
      });
    }

    // Active project: move to Trash
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function() {
        projectToActOn = project;
        modalAction = "trash";

        // Update trash modal content
        modalTitle.textContent = "Move project to Trash?";
        modalText.textContent = "This project will be moved to Trash. You can restore it later.";
        confirmActionBtn.textContent = "Move to Trash";
        confirmActionBtn.className = "btn !shadow-none bg-red-800 hover:bg-red-700 text-slate-100 border border-red-700";

        actionModal.showModal();
      });
    }

    // Trashed project: restore
    if (restoreBtn) {
      restoreBtn.addEventListener("click", function() {
        projectToActOn = project;
        modalAction = "restore";

        // Update restore modal content
        modalTitle.textContent = "Restore project?";
        modalText.textContent = "This project will move back to All Active Projects.";
        confirmActionBtn.textContent = "Restore";
        confirmActionBtn.className = "btn !shadow-none bg-emerald-800 hover:bg-emerald-700 text-slate-100 border border-emerald-700";

        actionModal.showModal();
      });
    }

    // Trashed project: delete forever
    if (permanentDeleteBtn) {
      permanentDeleteBtn.addEventListener("click", function() {
        projectToActOn = project;
        modalAction = "deleteForever";

        // Update trash modal content
        modalTitle.textContent = "Permanently delete project?";
        modalText.textContent = "This cannot be undone. The project will be removed forever.";
        confirmActionBtn.textContent = "Delete Forever";
        confirmActionBtn.className = "btn !shadow-none bg-red-800 hover:bg-red-900 text-slate-100 border border-red-800";

        actionModal.showModal();
      });
    }

    // Active project: open notes modal
    if (notesBtn) {
      notesBtn.addEventListener("click", function(){

        // Save which project we are adding/editing notes for
        projectToNote = project;

        // Fill the textarea with this project's current notes
        // If the project has no notes yet, use an empty string
        projectNotes.value = project.notes || "";

        // Open the notes modal
        notesModal.showModal();
      });
    }

    // Add the card to the project list container
    projectList.appendChild(projectCard);

  });
}
// End of Render Projects
// =======================

// =====================
// Intro Animation
// Check whether the intro has already played in this browser tab
const hasSeenPageScoperIntro = sessionStorage.getItem("hasSeenPageScoperIntro");

// Text that will be typed on screen
const logoStart = "&lt;Page";
const logoMiddle = '<span class="text-indigo-400">Scoper</span>';
const logoEnd = "/&gt;";

// Full text that will be typed letter-by-letter
const fullText = "PageScoper";

// Stores typed letters
let currentText = "";

// Current typing position
let currentIndex = 0;

// Function to type logo
function typeLogo() {

  // Continue typing if letters remain
  if (currentIndex < fullText.length) {

    // Add next character
    currentText += fullText[currentIndex];

    // Split the text into:
    // "Page" and "Scoper"
    const pagePart = currentText.slice(0, 4);
    const scoperPart = currentText.slice(4);

    // Build styled logo HTML
    introLogo.innerHTML = `
      <span class="text-slate-400">&lt;</span>
      <span class="text-slate-100">${pagePart}</span><span class="text-indigo-400">${scoperPart}</span>
      <span class="text-slate-400">/&gt;</span>
    `;

    // Move to next character
    currentIndex++;

    // Repeat typing
    setTimeout(typeLogo, 80);

  } else {

    // Wait before revealing app
    setTimeout(showApp, 400);
  }
}

// Function to hide intro screen and reveal app
function showApp() {

  // Fade out the intro screen
  introScreen.classList.add("opacity-0");

  // Wait for fade animation to finish
  setTimeout(function() {

    // Completely remove intro screen
    introScreen.style.display = "none";

    // Reveal the app
    appShell.classList.remove("opacity-0", "translate-y-3");

  }, 500);
}

// If the intro has already played in this tab,
// skip the intro and show the app immediately
if (hasSeenPageScoperIntro) {

  introScreen.style.display = "none";

  appShell.classList.remove("opacity-0", "translate-y-3");

} else {

  // Mark the intro as played for this browser tab
  sessionStorage.setItem("hasSeenPageScoperIntro", "true");

  // Wait briefly before starting the intro animation
  setTimeout(function() {

  typeLogo();

}, 400);

}
// End of Intro Animation
// =====================

// =====================
// App Initialization
// Show the empty state when the page first loads
renderProjects();
// End of App Initialization
// =====================
