/**
 * Cloudflare Worker for handling Secret Santa events.
 * Supports:
 * - Creating events
 * - Adding people to events
 * - Getting participants for an event
 * - Generating Secret Santa assignments
 * - Getting a specific user's Secret Santa assignment
 */

export default {
	async fetch(request, env) {
		const { pathname } = new URL(request.url);

		// Handle CORS preflight request
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		// CREATE an event (POST /api/events)
		if (request.method === 'POST' && pathname === '/api/events') {
			try {
				const requestBody = await request.json();
				const { eventName } = requestBody;

				if (!eventName) {
					return new Response(JSON.stringify({ error: 'Event name is required' }), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					});
				}

				// Insert the event and fetch the last inserted ID in one transaction
				const result = await env.DB.transaction(async (db) => {
					await db.prepare('INSERT INTO Events (EventName) VALUES (?)').bind(eventName).run();
					return await db.prepare('SELECT last_insert_rowid() AS EventId').first();
				});

				if (!result || !result.EventId) {
					throw new Error('Failed to retrieve EventId');
				}

				return new Response(JSON.stringify({ message: 'Event created successfully', eventId: result.EventId }), {
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (error) {
				console.error(error);
				return new Response(JSON.stringify({ error: 'Error creating event' }), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			}
		}

		// ADD a person to an event (POST /api/events/:eventId/people)
		if (request.method === 'POST' && pathname.startsWith('/api/events/') && pathname.includes('/people')) {
			const eventId = pathname.split('/')[3];
			try {
				const requestBody = await request.json();
				const { name, email } = requestBody;

				if (!name) {
					return new Response(JSON.stringify({ error: 'Name is required' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
					});
				}

				await env.DB.prepare('INSERT INTO People (EventId, Name, Email) VALUES (?, ?, ?)').bind(eventId, name, email).run();
				return new Response(JSON.stringify({ message: 'Person added successfully' }), {
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			} catch (error) {
				return new Response(JSON.stringify({ error: 'Error adding person to event' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			}
		}

		// GET all participants in an event (GET /api/events/:eventId/people)
		if (request.method === 'GET' && pathname.startsWith('/api/events/') && pathname.includes('/people')) {
			const eventId = pathname.split('/')[3];
			const { results } = await env.DB.prepare('SELECT * FROM People WHERE EventId = ?').bind(eventId).all();

			return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
		}

		// Generate and store Secret Santa assignments (POST /api/events/:eventId/assignments)
		if (request.method === 'POST' && pathname.startsWith('/api/events/') && pathname.includes('/assignments')) {
			const eventId = pathname.split('/')[3];

			// Step 1: Get all participants in the event
			const { results } = await env.DB.prepare('SELECT PersonId FROM People WHERE EventId = ?').bind(eventId).all();

			if (results.length < 2) {
				return new Response(JSON.stringify({ error: 'Not enough participants to generate Secret Santa assignments' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			}

			// Step 2: Randomize assignments
			const participants = results.map((row) => row.PersonId);
			const assignments = [];
			let shuffled = [...participants];

			// Shuffle and pair
			for (let i = 0; i < participants.length; i++) {
				let randomIndex = Math.floor(Math.random() * shuffled.length);
				let giver = participants[i];
				let receiver = shuffled[randomIndex];

				// Ensure no one is assigned to themselves
				while (giver === receiver) {
					randomIndex = Math.floor(Math.random() * shuffled.length);
					receiver = shuffled[randomIndex];
				}

				assignments.push({ giverId: giver, receiverId: receiver });
				shuffled = shuffled.filter((id) => id !== receiver); // Remove assigned receiver from shuffled list
			}

			// Step 3: Store assignments in the database
			for (const { giverId, receiverId } of assignments) {
				await env.DB.prepare('INSERT INTO SecretSantaAssignments (EventId, GiverId, ReceiverId) VALUES (?, ?, ?)')
					.bind(eventId, giverId, receiverId)
					.run();
			}

			return new Response(JSON.stringify({ message: 'Secret Santa assignments generated successfully' }), {
				headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
			});
		}

		// GET Secret Santa assignment for a specific user (GET /api/events/:eventId/people/:personId/assignment)
		if (
			request.method === 'GET' &&
			pathname.startsWith('/api/events/') &&
			pathname.includes('/people/') &&
			pathname.includes('/assignment')
		) {
			const eventId = pathname.split('/')[3];
			const personId = pathname.split('/')[5];

			// Step 1: Fetch the Secret Santa assignment for the user
			const { results } = await env.DB.prepare('SELECT ReceiverId FROM SecretSantaAssignments WHERE EventId = ? AND GiverId = ?')
				.bind(eventId, personId)
				.all();

			if (results.length === 0) {
				return new Response(JSON.stringify({ error: 'No Secret Santa assignment found for this user' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			}

			const assignment = results[0];
			return new Response(JSON.stringify({ giverId: personId, receiverId: assignment.ReceiverId }), {
				headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
			});
		}

		// Default response
		return new Response('Secret Santa API', {
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		});
	},
};
