// Get eventId from the URL
const queryParams = new URLSearchParams(window.location.search);
const eventId = queryParams.get("eventid");

if (eventId) {
  // Fetch participants
  fetch(
    `https://d1-secret-santa.matthewincardona.com/api/events/${eventId}/people`
  )
    .then((response) => response.json())
    .then((participants) => {
      if (participants.length > 0) {
        const participantsList = document.getElementById("participantsList");

        // Display participants with "Copy Link" buttons
        participants.forEach((person) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${person.Name}`;

          // Create the "Copy Link" button
          const copyButton = document.createElement("button");
          copyButton.textContent = "Copy Link";
          copyButton.style.marginLeft = "10px";
          var randomPersonId = person.PersonId * 7 * 4;
          copyButton.addEventListener("click", () => {
            const link = ``;
            console.log(link);
            navigator.clipboard
              .writeText(link)
              .then(() => alert(`Link copied: ${link}`))
              .catch((err) => console.error("Error copying link:", err));
          });

          listItem.appendChild(copyButton);
          participantsList.appendChild(listItem);
        });
      } else {
        console.log("No participants found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching participants:", error);
    });

  // Fetch Secret Santa assignments
  fetch(
    `https://d1-secret-santa.matthewincardona.com/api/events/${eventId}/assignments`
  )
    .then((response) => response.json())
    .then((assignments) => {
      if (assignments.length > 0) {
        const assignmentsList = document.getElementById("assignmentsList");

        // Display assignments with names
        assignments.forEach((assignment) => {
          const listItem = document.createElement("li");
          listItem.textContent = `Giver: ${assignment.GiverName} → Receiver: ${assignment.ReceiverName}`;
          assignmentsList.appendChild(listItem);
        });
      } else {
        console.log("No assignments found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching assignments:", error);
    });
} else {
  console.error("No eventId in the URL.");
}
