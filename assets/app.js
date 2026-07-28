(() => {
  const grid = document.querySelector("#project-grid");
  const cards = [...document.querySelectorAll(".project-card")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const searchInput = document.querySelector("#project-search");
  const countLabel = document.querySelector("#project-count");
  const clearButton = document.querySelector("#clear-search");
  const emptyState = document.querySelector("#empty-state");

  if (!grid || !cards.length || !searchInput) return;

  let activeFilter = "all";

  const normalize = (value) =>
    value
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, " ")
      .trim();

  const updateProjects = () => {
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const matchesCategory =
        activeFilter === "all" || card.dataset.category === activeFilter;
      const searchableText = normalize(
        `${card.dataset.search || ""} ${card.textContent || ""}`,
      );
      const matchesSearch = !query || searchableText.includes(query);
      const visible = matchesCategory && matchesSearch;

      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    countLabel.textContent = `显示 ${visibleCount} 个项目`;
    emptyState.hidden = visibleCount !== 0;
    clearButton.hidden = activeFilter === "all" && !query;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      updateProjects();
    });
  });

  searchInput.addEventListener("input", updateProjects);

  clearButton.addEventListener("click", () => {
    activeFilter = "all";
    searchInput.value = "";
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === "all";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateProjects();
    searchInput.focus();
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;

    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      searchInput.focus();
    }

    if (event.key === "Escape" && document.activeElement === searchInput) {
      searchInput.value = "";
      updateProjects();
      searchInput.blur();
    }
  });

  filterButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === "all"),
    );
  });

  updateProjects();
})();
