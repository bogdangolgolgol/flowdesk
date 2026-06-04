export async function POST(request) {
  const { prompt } = await request.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are FlowDesk AI, a productivity assistant for freelancers. 
Create a practical, optimized daily schedule based on the user's tasks and constraints.
Return ONLY a JSON array of schedule blocks, no other text:
[{"time": "09:00", "task": "Task name", "client": "Client name", "duration": "2h", "note": "brief tip"}]
Max 6 blocks. Be realistic with timing. Add short breaks.`,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const text = data.content[0].text.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  const blocks = JSON.parse(clean)

  return Response.json({ blocks })
}
