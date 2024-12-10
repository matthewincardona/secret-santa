// Get eventId from the URL
const queryParams = new URLSearchParams(window.location.search);
const eventId = queryParams.get("eventid");

if (eventId) {
  // Fetch participants
  fetch(`http://localhost:8787/api/events/${eventId}/people`)
    .then((response) => response.json())
    .then((participants) => {
      if (participants.length > 0) {
        const participantsList = document.getElementById("participantsList");

        participants.forEach((person) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${person.Name}`;
          participantsList.appendChild(listItem);
        });

        // Generate Secret Santa assignments
        const assignments = generateSecretSantaAssignments(participants);

        // Display the assignments
        const assignmentsList = document.getElementById("assignmentsList");
        assignments.forEach((assignment) => {
          const listItem = document.createElement("li");
          const giver = participants.find(
            (person) => person.PersonId === assignment.giverId
          );
          const receiver = participants.find(
            (person) => person.PersonId === assignment.receiverId
          );
          listItem.textContent = `${giver.Name} → ${receiver.Name}`;
          assignmentsList.appendChild(listItem);
        });

        // Send the assignments to the backend to save them in the database
        storeAssignments(assignments);
      } else {
        console.log("No participants found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching participants:", error);
    });
} else {
  console.error("No eventId in the URL.");
}

// Function to generate Secret Santa assignments
function generateSecretSantaAssignments(participants) {
  let shuffled = [...participants];
  const assignments = [];

  // Shuffle and pair participants
  for (let i = 0; i < participants.length; i++) {
    let randomIndex = Math.floor(Math.random() * shuffled.length);
    let giver = participants[i];
    let receiver = shuffled[randomIndex];

    // Ensure no one is assigned to themselves
    while (giver.PersonId === receiver.PersonId) {
      randomIndex = Math.floor(Math.random() * shuffled.length);
      receiver = shuffled[randomIndex];
    }

    assignments.push({
      giverId: giver.PersonId,
      receiverId: receiver.PersonId,
    });

    // Remove assigned receiver from shuffled list
    shuffled = shuffled.filter(
      (person) => person.PersonId !== receiver.PersonId
    );
  }

  return assignments;
}

// Function to send assignments to the backend
function storeAssignments(assignments) {
  fetch(`http://localhost:8787/api/events/${eventId}/assignments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assignments: assignments,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        console.log("Assignments saved to the backend.");
      } else {
        console.error("Error saving assignments");
      }
    })
    .catch((error) => {
      console.error("Error saving assignments:", error);
    });
}
