export type FormApiResponse = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type SubmitState = {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string>;
};

export const initialSubmitState: SubmitState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
