var addField = document.getElementById("addField");
var addPeople__Fields = document.getElementById("addPeople__Fields");
var createEventBtn = document.getElementById("createEventBtn");
var eventNameInput = document.getElementById("eventName");
var eventName = "";
var people = [];
var eventId = "";

// Add new input field for participants
addField.addEventListener("click", function () {
  console.log("Adding new input field for participant...");

  var wrapperDiv = document.createElement("div");
  var newField = document.createElement("input");
  newField.type = "text";
  newField.placeholder = "Name";
  newField.maxLength = 30;

  var trashCan = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  trashCan.classList.add("trashCan");
  trashCan.setAttribute("viewBox", "0 0 448 512");

  var trashPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  trashPath.setAttribute(
    "d",
    "M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
  );
  trashCan.appendChild(trashPath);

  trashCan.addEventListener("click", function () {
    console.log("Removed input field");
    wrapperDiv.remove();
  });

  wrapperDiv.appendChild(newField);
  wrapperDiv.appendChild(trashCan);
  addPeople__Fields.appendChild(wrapperDiv);
  newField.focus();
});

// Create event and add people
createEventBtn.addEventListener("click", function () {
  console.log("Create Event button clicked");

  eventName = eventNameInput.value.trim();
  console.log("Event name:", eventName);

  people = [];
  var inputFields = addPeople__Fields.querySelectorAll("input[type='text']");

  inputFields.forEach((inputField) => {
    var name = inputField.value.trim();
    if (name) people.push(name);
  });

  console.log("Participants collected:", people);

  // Step 1: Create the event
  console.log("Creating event...");
  fetch("https://d1-secret-santa.matthewincardona.com/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName: eventName }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Event creation response:", data);
      if (data.eventId) {
        eventId = data.eventId;
        console.log("Event ID:", eventId);

        // Step 2: Add participants
        console.log("Adding participants...");
        const addPeoplePromises = people.map((person) => {
          console.log("Adding participant:", person);
          return fetch(
            `https://d1-secret-santa.matthewincardona.com/api/events/${eventId}/people`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: person }),
            }
          );
        });

        return Promise.all(addPeoplePromises).then(() => eventId);
      } else {
        throw new Error("No eventId returned from server");
      }
    })
    .then((eventId) => {
      console.log("All participants added. Fetching participants...");
      return fetch(
        `https://d1-secret-santa.matthewincardona.com/api/events/${eventId}/people`
      );
    })
    .then((response) => response.json())
    .then((participants) => {
      console.log("Fetched participants:", participants);
      if (participants.length > 1) {
        console.log("Generating assignments...");
        const assignments = generateSecretSantaAssignments(participants);
        console.log("Generated assignments:", assignments);
        return storeAssignments(eventId, assignments);
      } else {
        throw new Error("At least 2 participants are required.");
      }
    })
    .then(() => {
      console.log("Assignments successfully saved.");
      alert("Event and assignments created successfully!");
      window.location.href = `/event.html?eventid=${eventId}`;
    })
    .catch((error) => {
      console.error("Error during event creation:", error);
      alert("There was an error creating the event or assignments.");
    });
});

// Function to generate Secret Santa assignments
function generateSecretSantaAssignments(participants) {
  console.log("Generating Secret Santa assignments...");
  let shuffled = [...participants];
  const assignments = [];

  for (let i = 0; i < participants.length; i++) {
    let randomIndex = Math.floor(Math.random() * shuffled.length);
    let giver = participants[i];
    let receiver = shuffled[randomIndex];

    // Ensure no self-assignment
    while (giver.PersonId === receiver.PersonId) {
      console.log("Self-assignment detected. Retrying...");
      randomIndex = Math.floor(Math.random() * shuffled.length);
      receiver = shuffled[randomIndex];
    }

    console.log(`Assignment: ${giver.PersonId} → ${receiver.PersonId}`);
    assignments.push({
      giverId: giver.PersonId,
      receiverId: receiver.PersonId,
    });

    shuffled = shuffled.filter(
      (person) => person.PersonId !== receiver.PersonId
    );
  }

  console.log("Final assignments:", assignments);
  return assignments;
}

// Function to send assignments to the backend
function storeAssignments(eventId, assignments) {
  console.log("Storing assignments:", assignments);
  return fetch(
    `https://d1-secret-santa.matthewincardona.com/api/events/${eventId}/assignments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignments: assignments }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Assignments storage response:", data);
      return data;
    });
}
