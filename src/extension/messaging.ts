// extension/messaging.ts

export function safeSendMessage<T = any, R = any>(msg: T): Promise<R | null> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(msg, (res) => {
        if (chrome.runtime.lastError) {
          console.warn("sendMessage error:", chrome.runtime.lastError.message);
          resolve(null);
        } else {
          resolve(res);
        }
      });
    } catch (err) {
      console.error("sendMessage failed:", err);
      resolve(null);
    }
  });
}
