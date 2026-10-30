# SCRUM-66 — Catalogue shopping selection state

Reproduced on main b07250e: sorting after saving/comparing a product resets its
newly rendered buttons to aria-pressed=false while storage still holds it.
The regression failed before the fix. Catalogue redraw now calls the existing
shopping button updater. Kyle's feature logic is unchanged.

Validation: 34 Node tests and 42 Edge browser groups, including 18 page/viewport
checks. The added integration group covers selected button labels/aria-pressed,
wishlist count, unchanged storage, all filter controls, empty/invalid results,
reset, reload and toggling the selections off. Evidence:
docs/catalog-shopping-integration-test-results.json.
