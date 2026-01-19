export type AIStorageState =
  | {
    status: "loading";
  }
  | {
    status: "ready";
    data: { usage: string; sharing: string };
  }
  | {
    status: "error";
    message: string;
    code?: import("./errors").AIErrorCode;
    details?: unknown;
  };
