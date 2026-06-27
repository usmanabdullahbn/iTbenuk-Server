export const courses = [
  {
    id: "product-management-ai",
    title: "Product Management + AI",
    price: 25000,
    currency: "NGN",
    status: "active",
    duration: "6 weeks",
    level: "Beginner to intermediate",
    description:
      "Learn product strategy, discovery, roadmapping, AI workflows, and portfolio-ready product thinking.",
    outcomes: ["AI-assisted product discovery", "Roadmaps and PRDs", "Launch metrics", "Portfolio project"],
    modules: [
      {
        title: "Product thinking foundations",
        description: "Understand customer problems, product roles, and how AI changes discovery work.",
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        pdf: "Product-thinking-foundations.pdf",
        resources: ["Discovery interview checklist", "Customer problem canvas"]
      },
      {
        title: "AI-assisted discovery and research",
        description: "Use AI tools to synthesize interviews, map competitors, and turn signals into insight.",
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        pdf: "AI-discovery-workbook.pdf",
        resources: ["Prompt library", "Research synthesis template"]
      },
      {
        title: "Roadmaps, PRDs, and launch metrics",
        description: "Build a practical roadmap, write a focused PRD, and define measurable launch goals.",
        video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        pdf: "Roadmap-and-PRD-guide.pdf",
        resources: ["PRD template", "Metrics planning sheet"]
      }
    ]
  },
  {
    id: "web-development",
    title: "Web Development",
    status: "coming-soon",
    description: "Frontend, backend, deployment, and practical web app delivery."
  },
  {
    id: "data-analysis",
    title: "Data Analysis",
    status: "coming-soon",
    description: "Spreadsheets, SQL, dashboards, Python foundations, and insight storytelling."
  },
  {
    id: "research-writing",
    title: "Research Writing",
    status: "coming-soon",
    description: "Academic research structure, citation workflows, literature reviews, and AI-assisted drafting."
  }
];
