DROP TABLE IF EXISTS Events;
CREATE TABLE IF NOT EXISTS Events (
    EventId INTEGER PRIMARY KEY AUTOINCREMENT, 
    EventName VARCHAR(255) NOT NULL,
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS People;
CREATE TABLE IF NOT EXISTS People (
    PersonId INTEGER PRIMARY KEY AUTOINCREMENT,
    EventId INT,
    Name VARCHAR(255) NOT NULL,
    FOREIGN KEY (EventId) REFERENCES Events(EventId)
);

DROP TABLE IF EXISTS SecretSantaAssignments;
CREATE TABLE IF NOT EXISTS SecretSantaAssignments (
    SecretSantaAssignmentsId INTEGER PRIMARY KEY AUTOINCREMENT,
    EventId INT,
    GiverId INT,
    ReceiverId INT,
    FOREIGN KEY (EventId) REFERENCES Events(EventId),
    FOREIGN KEY (GiverId) REFERENCES People(PersonId),
    FOREIGN KEY (ReceiverId) REFERENCES People(PersonId),
    CONSTRAINT no_self_assignment CHECK (GiverId != ReceiverId)
);
