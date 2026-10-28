export function focusRecipeInput(input) {
  if (!input) return;

  input.focus({ preventScroll: true });

  input.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}
