/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const path = '/v1/chat/completions';

async function handleRequest(request) {
	try {
		if (request.method === 'OPTIONS') {
			return getResponse('', 204);
		}
		if (request.method !== 'POST') {
			return getResponse('Only POST requests are allowed', 405);
		}
		if (!request.url.endsWith(path)) {
			return getResponse(`Only support ${path}`, 404);
		}

		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return getResponse('Unauthorized', 401);
		}

		const data = await request.json();
		const messages = data.messages || [];
		const model = data.model;
		const temperature = data.temperature || 0.6;
		const max_tokens = data.max_tokens || 8192;
		const top_p = Math.min(Math.max(data.top_p || 0.9, 0.0001), 0.9999);
		const stream = data.stream || false;

		const requestBody = {
			model: model,
			stream: stream,
			temperature: temperature,
			max_tokens: max_tokens,
			top_p: top_p,
			messages: messages,
		};
		console.log(`[${new Date().toString()}] body: ${JSON.stringify(requestBody)}, authHeader: ${authHeader}`);

		const apiUrl = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				Authorization: authHeader,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return getResponse(`Error from huggingface api: ${response.status} - ${errorText}`);
		}

		const newResponse = new Response(response.body, {
			status: response.status,
			headers: {
				...Object.fromEntries(response.headers),
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': '*',
				'Access-Control-Allow-Headers': '*',
			},
		});

		return newResponse;
	} catch (error) {
		return getResponse(
			JSON.stringify({
				error: `${error.message}`,
			}),
			500
		);
	}
}

function getResponse(resp, status) {
	return new Response(resp, {
		status: status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': '*',
			'Access-Control-Allow-Headers': '*',
		},
	});
}

addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});
