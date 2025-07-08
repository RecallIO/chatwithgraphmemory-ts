const messagesDiv = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
let cy;

function appendMessage(text, cls) {
  const div = document.createElement('div');
  div.textContent = text;
  div.className = `message ${cls}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function updateGraph() {
  const res = await fetch('/api/graph');
  if (!res.ok) return;
  const data = await res.json();
  const elements = data.map(r => ({
    data: { id: `${r.source}-${r.destination}`, source: r.source, target: r.destination, label: r.relationship }
  }));
  const nodes = {};
  data.forEach(r => {
    nodes[r.source] = true;
    nodes[r.destination] = true;
  });
  const nodeElements = Object.keys(nodes).map(id => ({ data: { id } }));
  const allElements = [...nodeElements, ...elements];
  if (!cy) {
    cy = cytoscape({
      container: document.getElementById('graph'),
      elements: allElements,
      style: [
        { selector: 'node', style: { label: 'data(id)', 'background-color': '#1a73e8', color: '#fff', 'text-valign': 'center', 'text-halign': 'center', 'text-outline-width': 1, 'text-outline-color': '#1a73e8' } },
        { selector: 'edge', style: { label: 'data(label)', 'curve-style': 'bezier', 'target-arrow-shape': 'triangle' } }
      ],
      layout: { name: 'cose' }
    });
  } else {
    cy.json({ elements: allElements });
    cy.layout({ name: 'cose' }).run();
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  input.value = '';
  try {
    const res = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    if (!res.ok) {
      const err = await res.json();
      appendMessage(`Error: ${err.error}`, 'bot');
      return;
    }
    const data = await res.json();
    if (data.type === 'answer') {
      if (data.results.length === 0) {
        appendMessage('No results found.', 'bot');
      } else {
        const lines = data.results.map(r => `${r.source} ${r.relationship} ${r.destination}`);
        appendMessage(lines.join('\n'), 'bot');
      }
    } else {
      appendMessage('Fact stored.', 'bot');
      await updateGraph();
    }
  } catch (err) {
    appendMessage('Network error', 'bot');
  }
});

window.addEventListener('load', updateGraph);
