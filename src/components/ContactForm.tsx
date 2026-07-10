import { AsyncForm } from "./AsyncForm";

export function ContactForm() {
  return (
    <AsyncForm action="/api/contact" submitLabel="Send message">
      <div className="fieldGrid two">
        <label>
          Name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label>
        Reason for contact
        <select name="reason" required defaultValue="">
          <option value="" disabled>
            Select a reason
          </option>
          <option>Community question</option>
          <option>Volunteer interest</option>
          <option>Partnership or sponsorship</option>
          <option>Media inquiry</option>
          <option>Business directory listing</option>
        </select>
      </label>
      <label>
        Message
        <textarea name="message" rows={6} required />
      </label>
    </AsyncForm>
  );
}
