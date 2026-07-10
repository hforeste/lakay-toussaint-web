import { AsyncForm } from "./AsyncForm";

const roles = ["Event day help", "Outreach", "Translation", "Setup/teardown"];

export function VolunteerForm() {
  return (
    <AsyncForm action="/api/volunteers" submitLabel="Volunteer with LTCA">
      <div className="fieldGrid two">
        <label>
          Name
          <input name="name" autoComplete="name" required />
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
          Availability
          <input name="availability" placeholder="Weekends, evenings..." />
        </label>
      </div>
      <fieldset>
        <legend>Areas of interest</legend>
        <div className="checkboxGrid">
          {roles.map((role) => (
            <label className="checkbox" key={role}>
              <input name="interests" type="checkbox" value={role} />
              {role}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Skills
        <textarea name="skills" rows={3} />
      </label>
      <label>
        Message
        <textarea name="message" rows={4} />
      </label>
    </AsyncForm>
  );
}
