"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { slugifyEventTitle } from "@/lib/slugify";
import type { AdminSurvey, AdminSurveyQuestion, AdminSurveyResponse, SurveyQuestionType, SurveyStatus } from "@/lib/surveys";

type DraftQuestion = AdminSurveyQuestion & { _key: string };
type SurveyDraft = Omit<AdminSurvey, "id" | "responseCount" | "questions"> & { questions: DraftQuestion[] };

const questionLabels: Record<SurveyQuestionType, string> = {
  short_text: "Short answer", long_text: "Long answer", email: "Email", single_choice: "Single choice", multiple_choice: "Multiple choice", rating: "Rating (1–5)",
};
const choiceTypes = new Set<SurveyQuestionType>(["single_choice", "multiple_choice"]);
const key = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const blankQuestion = (): DraftQuestion => ({ id: "", _key: key(), prompt: "", type: "long_text", required: false, options: [] });
const blankSurvey = (): SurveyDraft => ({ slug: "", title: "", description: "", status: "draft", thankYouMessage: "Thank you for sharing your feedback.", questions: [blankQuestion()] });
const draftFrom = (survey: AdminSurvey): SurveyDraft => ({ ...survey, questions: survey.questions.map((question) => ({ ...question, _key: question.id })) });

export function SurveyManager({ eventId, eventTitle, eventSlug, publicSiteUrl }: { eventId: string; eventTitle: string; eventSlug: string; publicSiteUrl: string }) {
  const [surveys, setSurveys] = useState<AdminSurvey[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SurveyDraft>(blankSurvey);
  const [mode, setMode] = useState<"edit" | "responses">("edit");
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const selected = surveys.find((survey) => survey.id === selectedId) || null;

  const load = useCallback(async (preferredId?: string) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/events/${eventId}/surveys`, { cache: "no-store" });
      const result = await response.json() as { surveys?: AdminSurvey[]; error?: string };
      if (!response.ok || !result.surveys) throw new Error(result.error || "Unable to load surveys.");
      setSurveys(result.surveys);
      const next = result.surveys.find((survey) => survey.id === preferredId) || result.surveys[0] || null;
      if (next) { setSelectedId(next.id); setDraft(draftFrom(next)); } else { setSelectedId(null); setDraft(blankSurvey()); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load surveys."); }
    finally { setBusy(false); }
  }, [eventId]);

  useEffect(() => { void Promise.resolve().then(() => load()); }, [load]);

  function choose(survey: AdminSurvey) { setSelectedId(survey.id); setDraft(draftFrom(survey)); setMode("edit"); setMessage(""); }
  function startNew() { setSelectedId(null); setDraft(blankSurvey()); setMode("edit"); setMessage(""); }
  function updateQuestion(index: number, changes: Partial<DraftQuestion>) { setDraft((current) => ({ ...current, questions: current.questions.map((question, i) => i === index ? { ...question, ...changes } : question) })); }
  function move(index: number, direction: -1 | 1) { setDraft((current) => { const next = [...current.questions]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return { ...current, questions: next }; }); }

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(selectedId ? `/api/events/${eventId}/surveys/${selectedId}` : `/api/events/${eventId}/surveys`, {
        method: selectedId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, questions: draft.questions.map((question) => ({ id: question.id, prompt: question.prompt, type: question.type, required: question.required, options: question.options })) }),
      });
      const result = await response.json() as { surveyId?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to save survey.");
      const id = result.surveyId || selectedId || undefined;
      await load(id); setMessage(selectedId ? "Survey updated." : "Survey created.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save survey."); setBusy(false); }
  }

  async function remove() {
    if (!selected || !window.confirm(`Delete “${selected.title}” and all of its responses?`)) return;
    setBusy(true); setMessage("");
    try { const response = await fetch(`/api/events/${eventId}/surveys/${selected.id}`, { method: "DELETE" }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || "Unable to delete survey."); await load(); setMessage("Survey deleted."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete survey."); setBusy(false); }
  }

  const publicUrl = `${publicSiteUrl}/events/${eventSlug}/surveys/${draft.slug || "survey-slug"}`;
  return (
    <div className="surveyManager">
      <div className="surveyManagerHeader"><div><p className="eyebrow">Questionnaires</p><h2>Event surveys</h2><p className="registrationEventName">{eventTitle}</p></div><button className="primaryButton" type="button" onClick={startNew}>New survey</button></div>
      <div className="surveyWorkspace">
        <aside className="surveyList" aria-label="Surveys">
          {surveys.map((survey) => <button type="button" key={survey.id} data-active={survey.id === selectedId} onClick={() => choose(survey)}><strong>{survey.title}</strong><span>{survey.status} · {survey.responseCount} response{survey.responseCount === 1 ? "" : "s"}</span></button>)}
          {!surveys.length && !busy ? <p>No surveys yet.</p> : null}
        </aside>
        <section className="surveyEditor">
          {selected ? <div className="surveyModeTabs"><button type="button" data-active={mode === "edit"} onClick={() => setMode("edit")}>Edit survey</button><button type="button" data-active={mode === "responses"} onClick={() => setMode("responses")}>Responses ({selected.responseCount})</button></div> : null}
          {mode === "responses" && selected ? <SurveyResponses eventId={eventId} survey={selected} key={selected.id} /> : (
            <form onSubmit={save}>
              <fieldset disabled={busy}><legend>{selected ? "Survey settings" : "Create survey"}</legend><div className="formGrid">
                <label className="wide">Title *<input required value={draft.title} onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value, slug: selectedId ? current.slug : slugifyEventTitle(e.target.value) }))} /></label>
                <label>Slug *<input required value={draft.slug} onChange={(e) => setDraft((current) => ({ ...current, slug: slugifyEventTitle(e.target.value) }))} /></label>
                <label>Status<select value={draft.status} onChange={(e) => setDraft((current) => ({ ...current, status: e.target.value as SurveyStatus }))}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></label>
                <label className="wide">Description<textarea rows={3} value={draft.description} onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))} /></label>
                <label className="wide">Thank-you message<textarea rows={2} value={draft.thankYouMessage} onChange={(e) => setDraft((current) => ({ ...current, thankYouMessage: e.target.value }))} /></label>
              </div><a className="surveyUrl" href={draft.status === "published" && draft.slug ? publicUrl : undefined} target="_blank" rel="noreferrer">{publicUrl}{draft.status === "published" ? " ↗" : ""}</a></fieldset>
              <div className="questionBuilder">
                <div className="questionBuilderHeading"><div><p className="eyebrow">Form builder</p><h3>Questions</h3></div><button className="secondaryButton" type="button" onClick={() => setDraft((current) => ({ ...current, questions: [...current.questions, blankQuestion()] }))}>Add question</button></div>
                {draft.questions.map((question, index) => <fieldset className="questionEditor" key={question._key} disabled={busy}><legend>Question {index + 1}</legend><div className="formGrid">
                  <label className="wide">Prompt *<input required value={question.prompt} onChange={(e) => updateQuestion(index, { prompt: e.target.value })} /></label>
                  <label>Answer type<select value={question.type} onChange={(e) => updateQuestion(index, { type: e.target.value as SurveyQuestionType, options: choiceTypes.has(e.target.value as SurveyQuestionType) ? question.options : [] })}>{Object.entries(questionLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                  <label className="checkboxLabel"><input type="checkbox" checked={question.required} onChange={(e) => updateQuestion(index, { required: e.target.checked })} />Required</label>
                  {choiceTypes.has(question.type) ? <label className="wide">Choices (one per line) *<textarea rows={4} value={question.options.join("\n")} onChange={(e) => updateQuestion(index, { options: e.target.value.split("\n") })} /></label> : null}
                </div><div className="questionActions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0}>Move up</button><button type="button" onClick={() => move(index, 1)} disabled={index === draft.questions.length - 1}>Move down</button><button className="removeQuestion" type="button" onClick={() => setDraft((current) => ({ ...current, questions: current.questions.filter((_, i) => i !== index) }))} disabled={draft.questions.length === 1}>Remove</button></div></fieldset>)}
              </div>
              <div className="formActions"><button className="primaryButton" type="submit" disabled={busy}>{busy ? "Saving…" : selected ? "Save survey" : "Create survey"}</button>{selected ? <button className="dangerButton" type="button" onClick={remove} disabled={busy}>Delete survey</button> : null}{message ? <p className="formMessage" role="status">{message}</p> : null}</div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function SurveyResponses({ eventId, survey }: { eventId: string; survey: AdminSurvey }) {
  const [responses, setResponses] = useState<AdminSurveyResponse[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; fetch(`/api/events/${eventId}/surveys/${survey.id}/responses`, { cache: "no-store" }).then(async (response) => { const result = await response.json() as { responses?: AdminSurveyResponse[]; error?: string }; if (!response.ok || !result.responses) throw new Error(result.error || "Unable to load responses."); if (active) setResponses(result.responses); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load responses."); }).finally(() => { if (active) setBusy(false); }); return () => { active = false; }; }, [eventId, survey.id]);
  if (busy) return <p className="feedbackEmpty">Loading responses…</p>;
  if (error) return <p className="formError">{error}</p>;
  if (!responses.length) return <p className="feedbackEmpty">No responses have been submitted yet.</p>;
  return <div className="surveyResponses">{responses.map((response) => <article key={response.id}><header><div><strong>{response.firstName} {response.lastName}</strong><span>{[response.email, response.phone].filter(Boolean).join(" · ") || "No optional contact details"}</span></div><time dateTime={response.createdAt}>{new Date(response.createdAt).toLocaleString()}</time></header><dl>{response.answers.map((answer) => <div key={answer.questionId}><dt>{answer.prompt}</dt><dd>{Array.isArray(answer.answer) ? answer.answer.join(", ") : String(answer.answer)}</dd></div>)}</dl></article>)}</div>;
}
