import { AsyncForm } from "./AsyncForm";

export function NewsletterForm() {
  return (
    <AsyncForm action="/api/newsletter" submitLabel="Join the list">
      <div className="fieldGrid two">
        <label>
          First name
          <input name="firstName" autoComplete="given-name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
    </AsyncForm>
  );
}
