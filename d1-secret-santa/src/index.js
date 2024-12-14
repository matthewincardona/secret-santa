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

				// Step 1: Insert the event
				await env.DB.prepare('INSERT INTO Events (EventName) VALUES (?)').bind(eventName).run();

				// Step 2: Fetch the last inserted EventId
				const result = await env.DB.prepare('SELECT last_insert_rowid() AS EventId').first();

				if (!result || !result.EventId) {
					throw new Error('Failed to retrieve EventId');
				}

				// Step 3: Respond with success and the EventId
				return new Response(
					JSON.stringify({
						message: 'Event created successfully',
						eventId: result.EventId,
					}),
					{
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					}
				);
			} catch (error) {
				console.error('Error creating event:', error);
				return new Response(JSON.stringify({ error: 'Error creating event' }), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			}
		}

		// GET Secret Santa assignments for a specific event (GET /api/events/:eventId/assignments)
		if (request.method === 'GET' && pathname.startsWith('/api/events/') && pathname.includes('/assignments')) {
			const eventId = pathname.split('/')[3];

			// Step 1: Fetch all assignments with names for the event
			const { results } = await env.DB.prepare(
				`
	  SELECT 
		  a.GiverId, 
		  g.Name AS GiverName, 
		  a.ReceiverId, 
		  r.Name AS ReceiverName
	  FROM 
		  SecretSantaAssignments a
	  JOIN 
		  People g ON a.GiverId = g.PersonId
	  JOIN 
		  People r ON a.ReceiverId = r.PersonId
	  WHERE 
		  a.EventId = ?
	`
			)
				.bind(eventId)
				.all();

			if (results.length === 0) {
				return new Response(JSON.stringify({ error: 'No assignments found for this event' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			}

			// Step 2: Return the assignments with names
			return new Response(JSON.stringify(results), {
				headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
			});
		}

		// ADD a person to an event (POST /api/events/:eventId/people)
		if (request.method === 'POST' && pathname.startsWith('/api/events/') && pathname.includes('/people')) {
			const eventId = pathname.split('/')[3];
			try {
				const requestBody = await request.json();
				const { name } = requestBody;

				if (!name) {
					return new Response(JSON.stringify({ error: 'Name is required' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
					});
				}

				await env.DB.prepare('INSERT INTO People (EventId, Name) VALUES (?, ?)').bind(eventId, name).run();
				return new Response(JSON.stringify({ message: 'Person added successfully' }), {
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			} catch (error) {
				console.error('Error adding person:', error);
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

		// Handle storing assignments (POST /api/events/:eventId/assignments)
		if (request.method === 'POST' && pathname.startsWith('/api/events/') && pathname.includes('/assignments')) {
			const eventId = pathname.split('/')[3];
			const requestBody = await request.json();
			const { assignments } = requestBody;

			if (!assignments || assignments.length === 0) {
				return new Response(JSON.stringify({ error: 'No assignments provided' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			}

			try {
				// Insert the assignments into the database
				for (const { giverId, receiverId } of assignments) {
					await env.DB.prepare('INSERT INTO SecretSantaAssignments (EventId, GiverId, ReceiverId) VALUES (?, ?, ?)')
						.bind(eventId, giverId, receiverId)
						.run();
				}
				return new Response(JSON.stringify({ message: 'Secret Santa assignments generated successfully' }), {
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			} catch (error) {
				console.error('Error inserting assignments:', error);
				return new Response(JSON.stringify({ error: 'Error saving assignments' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				});
			}
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

			console.log('Assignment fetched for personId', personId, ':', results); // Add this line to debug

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
