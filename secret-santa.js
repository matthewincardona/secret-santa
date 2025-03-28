// Get URL parameters
const queryParams = new URLSearchParams(window.location.search);
const eventId = queryParams.get("eventid");
const personId = queryParams.get("personid") / 7 / 4;
// console.log(eventId, personId);

// Get the HTML elements to update
const personNameElement = document.getElementById("person-name");
const assignmentElement = document.getElementById("assignment");

if (eventId && personId) {
  // Fetch participants
  fetch(
    `https://d1-secret-santa.matthewincardona.com/api/events/${eventId}/people`
  )
    .then((response) => response.json())
    .then((participants) => {
      const person = participants.find((p) => p.PersonId == personId);
      if (person) {
        personNameElement.textContent = `Happy Holidays, ${person.Name}!`;

        // Fetch all assignments for the event
        fetch(
          `https://d1-secret-santa.matthewincardona.com/api/events/${eventId}/assignments`
        )
          .then((response) => response.json())
          .then((assignments) => {
            // Find the assignment for the current person (Giver)
            const assignment = assignments.find((a) => a.GiverId == personId);
            if (assignment) {
              // Find the receiver using their PersonId
              const receiver = participants.find(
                (p) => p.PersonId == assignment.ReceiverId
              );
              if (receiver) {
                assignmentElement.textContent = `${receiver.Name}!`;
              } else {
                assignmentElement.textContent =
                  "Unable to find the recipient's name.";
              }
            } else {
              assignmentElement.textContent =
                "No Secret Santa assignment found for you.";
            }
          })
          .catch((error) => {
            console.error("Error fetching assignments:", error);
            assignmentElement.textContent =
              "Error fetching your assignment. Please try again later.";
          });
      } else {
        personNameElement.textContent = "Person not found in this event.";
        assignmentElement.textContent = "";
      }
    })
    .catch((error) => {
      console.error("Error fetching participants:", error);
      personNameElement.textContent = "Error loading event details.";
      assignmentElement.textContent = "Please try again later.";
    });
} else {
  personNameElement.textContent =
    "Invalid URL. Missing event or person information.";
  assignmentElement.textContent = "";
}

snowflakes();

function snowflakes() {
  // Create array of images to use in animation
  arr = imgArr();
  for (x = 0; x < 5; x++) {
    for (i = 0; i < 50; i++) {
      // Don't mind the obnoxious delay
      const opacity = Math.random() * 1;
      const duration = Math.random() * 100 + 2;
      const delay = Math.random() * 0;
      const translate = Math.random() * 1800;
      //   console.log(opacity);

      // Create images, set src using image array, and append to animation container
      var img = document.createElement("img");
      // img.src = arr[Math.floor((Math.random() * arr.length - 1))];
      img.src = arr[0];
      document.getElementById("anim-container").appendChild(img);

      // Animate images with random properties
      img.classList.add("animate");
      img.classList.add("img-anim");
      img.style.opacity = opacity;
      img.style.setProperty("--animation-delay", delay + "s");
      img.style.setProperty("--animation-duration", duration + "s");
      img.style.setProperty("--animation-move", translate + "px");
    }
  }
}

function imgArr() {
  let arr = [
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTEyLjAwMyA1MTIuMDAzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIuMDAzIDUxMi4wMDM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIHN0eWxlPSJmaWxsOiM4MEM3RUE7IiBkPSJNNTEyLjAwMiwyNTZjMC03LjQxNS02LjAxMS0xMy40MjctMTMuNDI3LTEzLjQyN2gtMjEuMTI3bDIwLjExMy0yMC4xMTMNCgljNS4yNDQtNS4yNDQsNS4yNDQtMTMuNzQ2LDAtMTguOTg5cy0xMy43NDUtNS4yNDQtMTguOTg5LDBsLTM5LjEwMywzOS4xMDNoLTE5Ljg3NWwyMC4xMTMtMjAuMTEzDQoJYzUuMjQ0LTUuMjQ0LDUuMjQ0LTEzLjc0NiwwLTE4Ljk4OWMtNS4yNDUtNS4yNDQtMTMuNzQ2LTUuMjQ0LTE4Ljk4OSwwbC0zOS4xMDMsMzkuMTAzaC05My4xOTdsNjUuOTAxLTY1LjkwMWg1NS4yOTkNCgljNy40MTYsMCwxMy40MjctNi4wMTEsMTMuNDI3LTEzLjQyN3MtNi4wMTEtMTMuNDI3LTEzLjQyNy0xMy40MjdoLTI4LjQ0NGwxNC4wNTQtMTQuMDU0aDU1LjI5OWM3LjQxNiwwLDEzLjQyNy02LjAxMSwxMy40MjctMTMuNDI3DQoJYzAtNy40MTYtNi4wMTEtMTMuNDI3LTEzLjQyNy0xMy40MjdoLTI4LjQ0NGwxNC45NC0xNC45NGM1LjI0NC01LjI0NCw1LjI0NC0xMy43NDYsMC0xOC45ODljLTUuMjQ0LTUuMjQ0LTEzLjc0Ni01LjI0NC0xOC45ODksMA0KCWwtMTQuOTQsMTQuOTRWNjEuNDc1YzAtNy40MTYtNi4wMTEtMTMuNDI3LTEzLjQyNy0xMy40MjdzLTEzLjQyNyw2LjAxMS0xMy40MjcsMTMuNDI3djU1LjI5OWwtMTQuMDU0LDE0LjA1NHYtMjguNDQzDQoJYzAtNy40MTYtNi4wMTEtMTMuNDI3LTEzLjQyNy0xMy40MjdjLTcuNDE2LDAtMTMuNDI3LDYuMDExLTEzLjQyNywxMy40Mjd2NTUuMjk5bC02NS45MDEsNjUuOTAxdi05My4xOTdsMzkuMTAzLTM5LjEwMw0KCWM1LjI0NC01LjI0NCw1LjI0NC0xMy43NDYsMC0xOC45ODljLTUuMjQ1LTUuMjQ0LTEzLjc0Ni01LjI0NC0xOC45ODksMGwtMjAuMTE0LDIwLjExM1Y3Mi41MzNsMzkuMTAzLTM5LjEwMw0KCWM1LjI0NC01LjI0NCw1LjI0NC0xMy43NDYsMC0xOC45ODljLTUuMjQ1LTUuMjQ0LTEzLjc0Ni01LjI0NC0xOC45ODksMGwtMjAuMTE0LDIwLjExM1YxMy40MjdDMjY5LjQyOSw2LjAxMSwyNjMuNDE4LDAsMjU2LjAwMiwwDQoJYy03LjQxNSwwLTEzLjQyNyw2LjAxMS0xMy40MjcsMTMuNDI3djIxLjEyN2wtMjAuMTEzLTIwLjExM2MtNS4yNDQtNS4yNDQtMTMuNzQ1LTUuMjQ0LTE4Ljk4OSwwDQoJYy01LjI0NCw1LjI0NC01LjI0NCwxMy43NDYsMCwxOC45ODlsMzkuMTAzLDM5LjEwM3YxOS44NzZsLTIwLjExMy0yMC4xMTNjLTUuMjQ0LTUuMjQ0LTEzLjc0NS01LjI0NC0xOC45ODksMA0KCWMtNS4yNDQsNS4yNDQtNS4yNDQsMTMuNzQ2LDAsMTguOTg5bDM5LjEwMywzOS4xMDN2OTMuMTk3bC02NS45MDEtNjUuOTAxdi01NS4zYzAtNy40MTYtNi4wMTEtMTMuNDI3LTEzLjQyNy0xMy40MjcNCglzLTEzLjQyNyw2LjAxMS0xMy40MjcsMTMuNDI3djI4LjQ0NGwtMTQuMDU0LTE0LjA1NHYtNTUuM2MwLTcuNDE2LTYuMDExLTEzLjQyNy0xMy40MjctMTMuNDI3Yy03LjQxNiwwLTEzLjQyNyw2LjAxMS0xMy40MjcsMTMuNDI3DQoJdjI4LjQ0NEw5My45NzIsNzQuOTgxYy01LjI0NC01LjI0NC0xMy43NDYtNS4yNDQtMTguOTg5LDBjLTUuMjQ0LDUuMjQ0LTUuMjQ0LDEzLjc0NiwwLDE4Ljk4OWwxNC45NCwxNC45NEg2MS40NzcNCgljLTcuNDE2LDAtMTMuNDI3LDYuMDExLTEzLjQyNywxMy40MjdzNi4wMTEsMTMuNDI3LDEzLjQyNywxMy40MjdoNTUuMjk5bDE0LjA1NCwxNC4wNTRoLTI4LjQ0Mw0KCWMtNy40MTYsMC0xMy40MjcsNi4wMTEtMTMuNDI3LDEzLjQyN3M2LjAxMSwxMy40MjcsMTMuNDI3LDEzLjQyN2g1NS4yOTlsNjUuOTAxLDY1LjkwMWgtOTMuMTk3TDkxLjI4NiwyMDMuNDcNCgljLTUuMjQ0LTUuMjQ0LTEzLjc0NS01LjI0NC0xOC45ODksMGMtNS4yNDQsNS4yNDQtNS4yNDQsMTMuNzQ2LDAsMTguOTg5bDIwLjExMywyMC4xMTNINzIuNTM1TDMzLjQzMiwyMDMuNDcNCgljLTUuMjQ0LTUuMjQ0LTEzLjc0NS01LjI0NC0xOC45ODksMGMtNS4yNDQsNS4yNDQtNS4yNDQsMTMuNzQ2LDAsMTguOTg5bDIwLjExMywyMC4xMTNIMTMuNDI5Yy03LjQxNiwwLTEzLjQyNyw2LjAxMi0xMy40MjcsMTMuNDI3DQoJYzAsNy40MTYsNi4wMTEsMTMuNDI3LDEzLjQyNywxMy40MjdoMjEuMTI4bC0yMC4xMTMsMjAuMTE0Yy01LjI0NCw1LjI0NC01LjI0NCwxMy43NDYsMCwxOC45ODkNCgljMi42MjIsMi42MjIsNi4wNTgsMy45MzMsOS40OTQsMy45MzNzNi44NzMtMS4zMTEsOS40OTQtMy45MzNsMzkuMTAzLTM5LjEwM2gxOS44NzZsLTIwLjExMywyMC4xMTQNCgljLTUuMjQ0LDUuMjQ0LTUuMjQ0LDEzLjc0NiwwLDE4Ljk4OWMyLjYyMiwyLjYyMiw2LjA1OCwzLjkzMyw5LjQ5NCwzLjkzM3M2Ljg3My0xLjMxMSw5LjQ5NC0zLjkzM2wzOS4xMDMtMzkuMTAzaDkzLjE5Nw0KCWwtNjUuOTAxLDY1LjkwMWgtNTUuMjk5Yy03LjQxNiwwLTEzLjQyNyw2LjAxMS0xMy40MjcsMTMuNDI3YzAsNy40MTYsNi4wMTEsMTMuNDI3LDEzLjQyNywxMy40MjdoMjguNDQ0bC0xNC4wNTQsMTQuMDU0aC01NS4zDQoJYy03LjQxNiwwLTEzLjQyNyw2LjAxMS0xMy40MjcsMTMuNDI3czYuMDExLDEzLjQyNywxMy40MjcsMTMuNDI3aDI4LjQ0NGwtMTQuOTQsMTQuOTRjLTUuMjQ0LDUuMjQ0LTUuMjQ0LDEzLjc0NSwwLDE4Ljk4OQ0KCWMyLjYyMiwyLjYyMiw2LjA1OCwzLjkzMyw5LjQ5NCwzLjkzM3M2Ljg3My0xLjMxMSw5LjQ5NC0zLjkzM2wxNC45NC0xNC45NHYyOC40NDRjMCw3LjQxNiw2LjAxMSwxMy40MjcsMTMuNDI3LDEzLjQyNw0KCWM3LjQxNiwwLDEzLjQyNy02LjAxMSwxMy40MjctMTMuNDI3di01NS4yOTlsMTQuMDU0LTE0LjA1NHYyOC40NDRjMCw3LjQxNiw2LjAxMSwxMy40MjcsMTMuNDI3LDEzLjQyN3MxMy40MjctNi4wMTEsMTMuNDI3LTEzLjQyNw0KCXYtNTUuMjk5bDY1LjkwMS02NS45MDF2OTMuMTk3bC0zOS4xMDMsMzkuMTAzYy01LjI0NCw1LjI0NC01LjI0NCwxMy43NDYsMCwxOC45ODljNS4yNDQsNS4yNDQsMTMuNzQ2LDUuMjQ0LDE4Ljk4OSwwbDIwLjExMy0yMC4xMTMNCgl2MTkuODc1bC0zOS4xMDMsMzkuMTAzYy01LjI0NCw1LjI0NC01LjI0NCwxMy43NDYsMCwxOC45ODljMi42MjIsMi42MjIsNi4wNTgsMy45MzMsOS40OTQsMy45MzNjMy40MzcsMCw2Ljg3My0xLjMxMSw5LjQ5NC0zLjkzMw0KCWwyMC4xMTMtMjAuMTEzdjIxLjEyN2MwLDcuNDE2LDYuMDEyLDEzLjQyNywxMy40MjcsMTMuNDI3YzcuNDE2LDAsMTMuNDI3LTYuMDExLDEzLjQyNy0xMy40Mjd2LTIxLjEyN2wyMC4xMTQsMjAuMTE0DQoJYzUuMjQ0LDUuMjQ0LDEzLjc0Niw1LjI0NCwxOC45ODksMHM1LjI0NC0xMy43NDUsMC0xOC45ODlsLTM5LjEwMy0zOS4xMDN2LTE5Ljg3NmwyMC4xMTQsMjAuMTE0DQoJYzIuNjIyLDIuNjIyLDYuMDU5LDMuOTMzLDkuNDk0LDMuOTMzczYuODczLTEuMzExLDkuNDk0LTMuOTMzYzUuMjQ0LTUuMjQ0LDUuMjQ0LTEzLjc0NSwwLTE4Ljk4OWwtMzkuMTAzLTM5LjEwM1YyODguNDINCglsNjUuOTAxLDY1LjkwMXY1NS4yOTljMCw3LjQxNiw2LjAxMSwxMy40MjcsMTMuNDI3LDEzLjQyN2M3LjQxNiwwLDEzLjQyNy02LjAxMSwxMy40MjctMTMuNDI3di0yOC40NDRsMTQuMDU0LDE0LjA1NHY1NS4yOTkNCgljMCw3LjQxNiw2LjAxMSwxMy40MjcsMTMuNDI3LDEzLjQyN3MxMy40MjctNi4wMTEsMTMuNDI3LTEzLjQyN3YtMjguNDQ0bDE0Ljk0LDE0Ljk0YzIuNjIyLDIuNjIyLDYuMDU5LDMuOTMzLDkuNDk0LDMuOTMzDQoJYzMuNDM3LDAsNi44NzMtMS4zMTEsOS40OTQtMy45MzNjNS4yNDQtNS4yNDQsNS4yNDQtMTMuNzQ1LDAtMTguOTg5bC0xNC45NC0xNC45NGgyOC40NDRjNy40MTYsMCwxMy40MjctNi4wMTEsMTMuNDI3LTEzLjQyNw0KCWMwLTcuNDE2LTYuMDExLTEzLjQyNy0xMy40MjctMTMuNDI3aC01NS4yOTlsLTE0LjA1NC0xNC4wNTRoMjguNDQ0YzcuNDE2LDAsMTMuNDI3LTYuMDExLDEzLjQyNy0xMy40MjcNCgljMC03LjQxNi02LjAxMS0xMy40MjctMTMuNDI3LTEzLjQyN2gtNTUuMjk5bC02NS45MDEtNjUuOTAxaDkzLjE5N2wzOS4xMDMsMzkuMTAzYzIuNjIyLDIuNjIyLDYuMDU5LDMuOTMzLDkuNDk0LDMuOTMzDQoJczYuODczLTEuMzExLDkuNDk0LTMuOTMzYzUuMjQ0LTUuMjQ0LDUuMjQ0LTEzLjc0NSwwLTE4Ljk4OWwtMjAuMTE0LTIwLjExNGgxOS44NzZsMzkuMTAzLDM5LjEwMw0KCWMyLjYyMiwyLjYyMiw2LjA1OSwzLjkzMyw5LjQ5NCwzLjkzM2MzLjQzNiwwLDYuODczLTEuMzExLDkuNDk0LTMuOTMzYzUuMjQ0LTUuMjQ0LDUuMjQ0LTEzLjc0NSwwLTE4Ljk4OWwtMjAuMTE0LTIwLjExNGgyMS4xMjcNCglDNTA1Ljk5LDI2OS40MjcsNTEyLjAwMiwyNjMuNDE2LDUxMi4wMDIsMjU2eiIvPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=",
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDEyOCAxMjgiPjxwYXRoIGQ9Ik0xMjIuNDI3LDgyLjJsLTE0LjU5MiwyLjQ5TDkwLjk4Myw3NC45NiwxMTUuODQ2LDY0LDkwLjk4OCw1My4wMzdsMTYuODQ3LTkuNzI2LDE0LjU5MiwyLjQ5LDEuMzQ1LTcuODg1TDExMi41MSwzNS45OTNsMy45NjYtMTAuNzE2LTcuNS0yLjc3Ny01LjE0LDEzLjg4M0w4Ni45ODksNDYuMTA5LDg5LjkyNiwxOS4xLDY4LDM1LjE1MnYtMTYuOUw3Ny40NTMsNi44NTUsNzEuMywxLjc0Nyw2NCwxMC41NDEsNTYuNywxLjc0Nyw1MC41NDcsNi44NTUsNjAsMTguMjQ4djE2LjlMMzguMDg0LDE5LjFsMi45MzgsMjcuMDE0TDI0LjE2NSwzNi4zODMsMTkuMDI2LDIyLjVsLTcuNSwyLjc3N0wxNS40OSwzNS45OTMsNC4yMjcsMzcuOTE2LDUuNTczLDQ1LjhsMTQuNTkyLTIuNDksMTYuODUxLDkuNzI4TDEyLjE2NCw2NCwzNy4wMjEsNzQuOTU4LDIwLjE2NSw4NC42ODksNS41NzMsODIuMiw0LjIyNyw5MC4wODQsMTUuNDksOTIuMDA3bC0zLjk2NywxMC43MTYsNy41LDIuNzc3LDUuMTM5LTEzLjg4MywxNi44NTYtOS43MzItMi45MzcsMjcuMDA4TDYwLDkyLjg0OXYxNi45bC05LjQ1MywxMS4zOTIsNi4xNTYsNS4xMDgsNy4zLTguNzkzLDcuMyw4Ljc5Myw2LjE1Ni01LjEwOEw2OCwxMDkuNzQ3di0xNi45bDIxLjkyNiwxNi4wNTEtMi45MzYtMjcsMTYuODQ0LDkuNzI1LDUuMTQsMTMuODgzLDcuNS0yLjc3N0wxMTIuNTEsOTIuMDA3bDExLjI2Mi0xLjkyM1pNOTYuMDE4LDY0LDgyLjQsNzAsNzIsNjRsMTAuNC02LjAwNlpNODAuMDEyLDM2LjI3Myw3OC40LDUxLjA2Niw2OCw1Ny4wNzJWNDUuMDY2Wk00OCwzNi4yNzRsMTIsOC43ODVWNTcuMDcybC0xMC4zOTItNlpNMzEuOTkzLDY0LDQ1LjYsNTgsNTYsNjQsNDUuNjA3LDcwWk00OCw5MS43MmwxLjYwOS0xNC43OTIsMTAuMzkzLTZWODIuOTM1Wm0zMi4wMTQsMEw2OCw4Mi45Mjh2LTEybDEwLjQsNi4wMDdaIiBmaWxsPSIjODFjOGVlIi8+PC9zdmc+Cg==",
  ];
  return arr;
}
