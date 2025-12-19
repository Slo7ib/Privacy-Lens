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
    };
