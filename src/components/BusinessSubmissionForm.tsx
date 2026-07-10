import { AsyncForm } from "./AsyncForm";

export function BusinessSubmissionForm() {
  return (
    <AsyncForm action="/api/business-submissions" submitLabel="Submit business">
      <div className="fieldGrid two">
        <label>
          Business name
          <input name="businessName" required />
        </label>
        <label>
          Owner/contact name
          <input name="contactName" autoComplete="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        <label>
          Category
          <input name="category" required placeholder="Food, legal, church, service..." />
        </label>
        <label>
          Location or service area
          <input name="location" placeholder="Seattle, South King County..." />
        </label>
      </div>
      <label>
        Description
        <textarea name="description" rows={4} required />
      </label>
      <div className="fieldGrid two">
        <label>
          Website
          <input name="website" type="url" />
        </label>
        <label>
          Social links
          <input name="socialLinks" />
        </label>
      </div>
      <label>
        Notes
        <textarea name="notes" rows={3} />
      </label>
      <label className="checkbox">
        <input name="haitianOwnedOrServing" type="checkbox" />
        Haitian-owned or Haitian-serving
      </label>
      <label className="checkbox">
        <input name="consent" type="checkbox" required />
        I confirm LTCA may contact me about this listing.
      </label>
    </AsyncForm>
  );
}
