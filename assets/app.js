(() => {
  const cards = [...document.querySelectorAll(".repo-card")];
  const groups = [...document.querySelectorAll(".repo-group")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const searchInput = document.querySelector("#project-search");
  const countLabel = document.querySelector("#project-count");

  if (!cards.length || !groups.length || !searchInput || !countLabel) return;

  let activeFilter = "all";

  const normalize = (value) =>
    value
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, " ")
      .trim();

  const updateRepositories = () => {
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

    groups.forEach((group) => {
      group.hidden = !group.querySelector(".repo-card:not([hidden])");
    });

    countLabel.textContent =
      visibleCount === 0
        ? "没有匹配的仓库"
        : `显示 ${visibleCount} 个仓库`;
  };

  filterButtons.forEach((button) => {
    const isDefault = button.dataset.filter === "all";
    button.setAttribute("aria-pressed", String(isDefault));

    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      updateRepositories();
    });
  });

  searchInput.addEventListener("input", updateRepositories);

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
      updateRepositories();
      searchInput.blur();
    }
  });

  updateRepositories();
})();
