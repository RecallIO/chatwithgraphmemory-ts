# RecallIO Graph Chat

A simple TypeScript app using the [RecallIO](https://www.npmjs.com/package/recallio) library. It lets you teach the bot relationships between people, places and things. Ask questions to retrieve those facts and see them rendered as a graph.

## Prerequisites

- Node.js 18+
- A RecallIO API key (sign up at [RecallIO](https://app.recallio.ai))

## Installation

```bash
npm install
```

Create a `.env` file and provide your API key and (optionally) project/user identifiers:

```
RECALLIO_API_KEY=YOUR_API_KEY
RECALLIO_PROJECT_ID=my-project
RECALLIO_USER_ID=my-user
```

## Development

Start the server in development mode (uses `nodemon`):

```bash
npm run dev
```

## Production build

```bash
npm run build
npm start
```

Navigate to `http://localhost:3000` and start chatting. Statements like

```
Alice manages Bob
Bob works in Paris
```

store facts. Questions ending with a question mark are searched, for example:

```
Where does Bob work?
```

The graph updates dynamically below the chat showing all stored relationships.

