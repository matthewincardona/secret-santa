var addField = document.getElementById("addField");
var addPeople__Fields = document.getElementById("addPeople__Fields");
var createEventBtn = document.getElementById("createEventBtn");
var eventNameInput = document.getElementById("eventName");
var eventName = "";
var people = [];

addField.addEventListener("click", function () {
  console.log("Field added...");

  // Create the wrapper div
  var wrapperDiv = document.createElement("div");

  // Create the input field
  var newField = document.createElement("input");
  newField.type = "text";
  newField.name = "name";
  newField.placeholder = "Name";
  newField.maxLength = 30;

  // Create the trashcan icon
  //   <!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
  var trashCan = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  trashCan.classList.add("trashCan");
  trashCan.setAttribute("xmlns", "http://www.w3.org/2000/svg");
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

  // Add a click event to the trashcan to remove the field
  trashCan.addEventListener("click", function () {
    wrapperDiv.remove();
  });

  // Append the input field and trashcan to the wrapper div
  wrapperDiv.appendChild(newField);
  wrapperDiv.appendChild(trashCan);

  // Append the wrapper div to the container
  addPeople__Fields.appendChild(wrapperDiv);

  // Focus new field
  newField.focus();
});

createEventBtn.addEventListener("click", function () {
  eventName = eventNameInput.value.trim();
  people = [];

  // Get all input elements within the addPeople__Fields container
  var inputFields = addPeople__Fields.querySelectorAll("input[type='text']");

  // Iterate through each input field and add its value to the people array
  inputFields.forEach(function (inputField) {
    var name = inputField.value.trim();
    if (name) {
      people.push(name);
    }
  });

  // Send the event name to the backend to create the event
  fetch("http://localhost:8787/api/events", {
    // fetch("https://d1-secret-santa.matthewincardona.workers.dev/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventName: eventName,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.eventId) {
        console.log("Event created successfully:", data);
        alert("Event created successfully!");

        // Add each person to the event
        const addPeoplePromises = people.map((person) => {
          return fetch(
            `http://localhost:8787/api/events/${data.eventId}/people`,
            // `https://d1-secret-santa.matthewincardona.workers.dev/api/events/${data.eventId}/people`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: person }),
            }
          );
        });

        // Wait for all people to be added before redirecting
        Promise.all(addPeoplePromises)
          .then(() => {
            console.log("All people added successfully.");
            // Redirect to the event page using the eventId
            window.location.href = `/event.html?eventid=${data.eventId}`;
          })
          .catch((error) => {
            console.error("Error adding people:", error);
            alert(
              "Event created, but there was an error adding some participants."
            );
            alert(
              "Failed to add all people to event. Please reload the page and try again."
            );
          });
      } else {
        console.error("Error creating event: No eventId returned");
        alert("There was an error creating the event.");
      }
    })
    .catch((error) => {
      console.error("Error creating event:", error);
      alert("There was an error creating the event.");
    });
});
