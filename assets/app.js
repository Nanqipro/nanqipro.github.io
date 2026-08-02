(() => {
  const root = document.documentElement;
  const themeOptions = [
    ...document.querySelectorAll(".theme-option[data-theme-value]"),
  ];
  const themeColor = document.querySelector("meta[name='theme-color']");

  const applyTheme = (theme, persist = false) => {
    const isDark = theme === "dark";
    root.dataset.theme = isDark ? "dark" : "light";

    themeOptions.forEach((option) => {
      const isActive = option.dataset.themeValue === root.dataset.theme;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-pressed", String(isActive));
    });

    if (themeColor) {
      themeColor.setAttribute("content", isDark ? "#111715" : "#f6f8f7");
    }

    if (persist) {
      try {
        localStorage.setItem("site-theme", root.dataset.theme);
      } catch {
        // Theme switching still works when storage is unavailable.
      }
    }
  };

  applyTheme(root.dataset.theme);

  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      applyTheme(option.dataset.themeValue, true);
    });
  });

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
