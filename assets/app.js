(() => {
  const themeIds = ["paper", "ink", "aurora", "terminal", "cosmos"];
  const darkThemes = new Set(["ink", "terminal", "cosmos"]);
  const themeColors = {
    paper: "#f7f6f2",
    ink: "#141413",
    aurora: "#edf8f4",
    terminal: "#07110c",
    cosmos: "#0f1224",
  };
  const themeSelect = document.querySelector("#theme-select");
  const systemScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const getSavedTheme = () => {
    const inlineChoice = document.documentElement.dataset.themeChoice;
    if (inlineChoice === "system" || themeIds.includes(inlineChoice)) {
      return inlineChoice;
    }

    try {
      const saved = localStorage.getItem("zj-theme");
      if (saved === "system" || themeIds.includes(saved)) return saved;
    } catch (_) {
      /* Keep the system preference when storage is unavailable. */
    }

    return "system";
  };

  let themeChoice = getSavedTheme();

  const resolveTheme = (choice) => {
    if (choice !== "system") return choice;
    return systemScheme.matches ? "ink" : "paper";
  };

  const applyTheme = (choice, persist = false) => {
    themeChoice = choice === "system" || themeIds.includes(choice) ? choice : "system";
    const resolved = resolveTheme(themeChoice);

    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeChoice = themeChoice;
    document.documentElement.style.colorScheme = darkThemes.has(resolved) ? "dark" : "light";

    if (themeSelect) themeSelect.value = themeChoice;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", themeColors[resolved]);

    if (persist) {
      try {
        localStorage.setItem("zj-theme", themeChoice);
      } catch (_) {
        /* Theme still works for this visit without storage. */
      }
    }
  };

  if (themeSelect) {
    themeSelect.addEventListener("change", (event) => {
      applyTheme(event.currentTarget.value, true);
    });
  }

  const handleSystemTheme = () => {
    if (themeChoice === "system") applyTheme("system");
  };

  if (typeof systemScheme.addEventListener === "function") {
    systemScheme.addEventListener("change", handleSystemTheme);
  } else if (typeof systemScheme.addListener === "function") {
    systemScheme.addListener(handleSystemTheme);
  }

  applyTheme(themeChoice);

  const contributionGrid = document.querySelector("#code-contribution-grid");

  if (contributionGrid) {
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 84; index += 1) {
      const square = document.createElement("span");
      const signal = (index * 17 + Math.floor(index / 7) * 11 + index % 5) % 23;
      const level = signal < 7 ? 0 : signal < 12 ? 1 : signal < 17 ? 2 : signal < 21 ? 3 : 4;

      square.className = `contribution-cell level-${level}`;
      square.style.setProperty("--pulse-delay", `${-((index * 37) % 43) / 10}s`);
      square.style.setProperty("--pulse-duration", `${2.8 + ((index * 13) % 19) / 10}s`);

      if (level >= 2 && (index % 4 === 0 || index % 11 === 0)) {
        square.classList.add("is-live");
      }

      fragment.appendChild(square);
    }

    contributionGrid.appendChild(fragment);
  }

  const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (navLinks.length && navSections.length) {
    let scrollFrame = 0;

    const updateCurrentSection = () => {
      const readingLine = window.scrollY + 150;
      let currentSection = navSections[0];

      navSections.forEach((section) => {
        if (section.offsetTop <= readingLine) currentSection = section;
      });

      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${currentSection.id}`;
        link.classList.toggle("is-current", isCurrent);

        if (isCurrent) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      scrollFrame = 0;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!scrollFrame) {
          scrollFrame = window.requestAnimationFrame(updateCurrentSection);
        }
      },
      { passive: true },
    );

    updateCurrentSection();
  }

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
