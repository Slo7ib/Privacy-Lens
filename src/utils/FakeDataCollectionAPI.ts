import { dataCollectionItems } from "../logic/classifyData";

// Fake API response for data collection analysis
// This simulates an AI response that answers each question with true/false
const fakeDataCollectionResponse = {
  id: "chatcmpl-datacollection-123",
  object: "chat.completion",
  created: 1734023812,
  model: "gpt-4.1",
  choices: [
    {
      index: 0,
      finish_reason: "stop",
      message: {
        role: "assistant",
        content: JSON.stringify({
          answers: [
            { element: "Phone Number", collected: true },
            { element: "Account Credentials", collected: true },
            { element: "Personal Information", collected: true },
            { element: "Email", collected: true },
            { element: "Links clicked", collected: true },
            { element: "Pages visited", collected: true },
            { element: "Cookie usage", collected: true },
            { element: "Device Type", collected: false },
            { element: "IP Address", collected: true },
            { element: "Payment Information", collected: false },
            { element: "Calendar Access", collected: false },
            { element: "Contact List", collected: false },
            { element: "Biometric Data", collected: false },
          ],
        }),
      },
    },
  ],
  usage: {
    prompt_tokens: 256,
    completion_tokens: 120,
    total_tokens: 376,
  },
};

export default fakeDataCollectionResponse;

