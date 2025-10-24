const { PrismaClient, Difficulty, SignCategory } = require('@prisma/client');

const prisma = new PrismaClient();

const difficultyLevels = [
  {
    difficulty: Difficulty.BEGINNER,
    label: 'Beginner',
    description: 'Fundamental concepts and terminology to help new practitioners get started.'
  },
  {
    difficulty: Difficulty.INTERMEDIATE,
    label: 'Intermediate',
    description: 'Expanded practices and patterns for teams with some operational experience.'
  },
  {
    difficulty: Difficulty.ADVANCED,
    label: 'Advanced',
    description: 'Complex scenarios that require deeper subject-matter expertise and cross-team coordination.'
  },
  {
    difficulty: Difficulty.EXPERT,
    label: 'Expert',
    description: 'Highly specialized knowledge reserved for strategic leaders and domain experts.'
  }
];

const categories = [
  {
    name: 'Strategic Alignment',
    description: 'Guidance and questions that ensure initiatives map back to organizational strategy.',
    signCategory: SignCategory.STRATEGY
  },
  {
    name: 'Implementation Planning',
    description: 'Content that supports translating strategy into executable plans.',
    signCategory: SignCategory.IMPLEMENTATION
  },
  {
    name: 'Governance & Compliance',
    description: 'Resources for governance practices, risk management, and compliance readiness.',
    signCategory: SignCategory.GOVERNANCE
  },
  {
    name: 'Enablement & Nurture',
    description: 'Materials focused on developing people, culture, and continuous learning.',
    signCategory: SignCategory.NURTURE
  }
];

const tags = [
  {
    name: 'Change Management',
    description: 'Managing organizational change and communication plans.'
  },
  {
    name: 'KPIs',
    description: 'Key performance indicators and measurement techniques.'
  },
  {
    name: 'Stakeholder Engagement',
    description: 'Engaging with and aligning diverse stakeholder groups.'
  },
  {
    name: 'Risk Assessment',
    description: 'Identifying and mitigating risks across strategic initiatives.'
  }
];

async function main() {
  for (const level of difficultyLevels) {
    await prisma.difficultyLevel.upsert({
      where: { difficulty: level.difficulty },
      update: {
        label: level.label,
        description: level.description
      },
      create: level
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
        signCategory: category.signCategory
      },
      create: category
    });
  }

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {
        description: tag.description
      },
      create: tag
    });
  }
}

main()
  .then(async () => {
    console.log('Database seeded successfully.');
  })
  .catch(async (error) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
