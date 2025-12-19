const fakeResponse = {
  id: "chatcmpl-9f82jd92k3ls81h2",
  object: "chat.completion",
  created: 1734023812,
  model: "gpt-4.1",
  choices: [
    {
      index: 0,
      finish_reason: "stop",
      message: {
        role: "assistant",
        content:
          'json ... `{"usage":"The privacy policy explains how the website collects and uses user data to operate the service, enhance functionality, and improve overall user experience.","sharing":"The policy indicates that user data may be shared with third-party partners or service providers for analytics, operational needs, or to support core features."}`',
      },
    },
  ],
  usage: {
    prompt_tokens: 128,
    completion_tokens: 58,
    total_tokens: 186,
  },
};

export default fakeResponse;
// content:
//           '{"usage":"The privacy policy explains how the website collects and uses user data to operate the service, enhance functionality, and improve overall user experience.","sharing":"The policy indicates that user data may be shared with third-party partners or service providers for analytics, operational needs, or to support core features."}',
