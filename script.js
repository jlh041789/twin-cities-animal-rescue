"use strict";
// Touchstone 4: small functions and two data structures support a purposeful rescue planner.
const RESCUE_CHOICES = [
  { id: "adoption", label: "Adoption", description: "Learn about adopting a rescue pet." },
  { id: "foster", label: "Fostering", description: "Offer temporary care for an animal." },
  { id: "volunteer", label: "Volunteering", description: "Help with events, care, and outreach." }
];
const STORAGE_KEYS = { interests: "tcar-rescue-interests-v1", availability: "tcar-availability-v1" };

function readInterests() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.interests) || "[]");
    return Array.isArray(saved) ? saved.filter(id => RESCUE_CHOICES.some(choice => choice.id === id)) : [];
  } catch { return []; }
}
function saveInterests(interests) {
  try { localStorage.setItem(STORAGE_KEYS.interests, JSON.stringify(interests)); } catch { /* Browser storage may be disabled. */ }
}
function selectedLabels(interests) {
  return RESCUE_CHOICES.filter(choice => interests.includes(choice.id)).map(choice => choice.label);
}
function renderInterests() {
  const container = document.getElementById("interest-choices");
  if (!container) return;
  const saved = readInterests();
  container.replaceChildren();
  RESCUE_CHOICES.forEach(choice => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${saved.includes(choice.id) ? "✓ Saved " : "+ Save "}${choice.label}`;
    button.setAttribute("aria-pressed", String(saved.includes(choice.id)));
    button.title = choice.description;
    button.addEventListener("click", () => {
      const next = readInterests();
      const updated = next.includes(choice.id) ? next.filter(id => id !== choice.id) : [...next, choice.id];
      saveInterests(updated);
      renderInterests();
    });
    container.appendChild(button);
  });
  const summary = document.getElementById("selection-summary");
  if (summary) summary.textContent = saved.length ? `Your saved interests: ${selectedLabels(saved).join(", ")}.` : "No interests selected yet.";
}
function setupPlanner() {
  if (!document.getElementById("interest-choices")) return;
  renderInterests();
  document.getElementById("clear-interests")?.addEventListener("click", () => { saveInterests([]); renderInterests(); });
}
function addErrorField(field) {
  let error = document.getElementById(`${field.id}-error`);
  if (!error) {
    error = document.createElement("span"); error.id = `${field.id}-error`;
    error.className = "field-error"; field.insertAdjacentElement("afterend", error);
  }
  field.setAttribute("aria-describedby", error.id);
  return error;
}
function validateField(field) {
  if (!field) return true;
  const value = field.value.trim();
  let message = "";
  if (field.required && !value) message = "This field is required.";
  else if (field.id === "full-name" && value.length < 2) message = "Please enter at least 2 characters.";
  else if (field.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email address (for example, name@example.com).";
  else if (["experience", "message"].includes(field.id) && value.length < 10) message = "Please enter at least 10 characters.";
  const error = addErrorField(field);
  error.textContent = message;
  if (message) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
  return !message;
}
function setupContactForm() {
  const form = document.getElementById("rescue-interest-form");
  if (!form) return;
  const fields = ["full-name", "email", "interest", "availability", "experience", "message"].map(id => document.getElementById(id));
  fields.forEach(field => {
    if (!field) return;
    addErrorField(field);
    field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => validateField(field));
  });
  const saved = readInterests();
  const labels = selectedLabels(saved);
  const savedMessage = document.getElementById("saved-interest-message");
  if (savedMessage && labels.length) savedMessage.textContent = `Saved in this browser: ${labels.join(", ")}. You can select one below and mention the others in your message.`;
  const interestField = document.getElementById("interest");
  if (saved.length && interestField && !interestField.value) interestField.value = saved[0];
  const availability = document.getElementById("availability");
  try {
    const previous = localStorage.getItem(STORAGE_KEYS.availability);
    if (previous && [...availability.options].some(o => o.value === previous)) availability.value = previous;
  } catch { /* Ignore disabled storage. */ }
  availability?.addEventListener("change", () => {
    try { localStorage.setItem(STORAGE_KEYS.availability, availability.value); } catch { /* Ignore disabled storage. */ }
  });
  form.addEventListener("submit", event => {
    event.preventDefault(); // The educational demo never sends personal data.
    const results = fields.map(field => ({ field, valid: validateField(field) }));
    const firstInvalid = results.find(result => !result.valid);
    const status = document.getElementById("form-status");
    if (firstInvalid) {
      status.textContent = "Please correct the highlighted fields before reviewing your inquiry.";
      firstInvalid.field.focus();
      return;
    }
    status.textContent = "Your information looks ready to review. This is a demonstration form: nothing was sent to the rescue or saved to a server.";
  });
}
document.addEventListener("DOMContentLoaded", () => { setupPlanner(); setupContactForm(); });
