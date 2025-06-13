# Design Evaluation API

This API implements task **3.2.3** from the project plan. It accepts an array of generated design concepts and returns a scored ranking from Azure OpenAI.

`POST /api/agent/evaluate-designs`

### Request Body
```json
{ "concepts": ["Concept 1", "Concept 2"] }
```
Include the `x-user-guid` header to associate results with the current user.

### Response
```json
{
  "userGuid": "<guid>",
  "evaluations": [
    { "concept": "Concept 1", "score": 8 },
    { "concept": "Concept 2", "score": 6 }
  ]
}
```
