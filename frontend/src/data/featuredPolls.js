/**
 * Featured & Curated Community Polls
 * Used for live demo exploration, fallback state, and immediate zero-setup interaction
 */

export const FEATURED_POLLS = [
  {
    id: 'sample-1',
    question: 'Which technology should students learn in 2027?',
    category: 'technology',
    creator_name: 'Alex Chen',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'active',
    total_votes: 123,
    options: [
      { id: 'opt-1', text: 'React & Next.js', votes: 42 },
      { id: 'opt-2', text: 'AI & Machine Learning (PyTorch, LLMs)', votes: 52 },
      { id: 'opt-3', text: 'Cloud & DevOps (Kubernetes, AWS/GCP)', votes: 17 },
      { id: 'opt-4', text: 'Cyber Security & Zero Trust', votes: 12 },
    ],
  },
  {
    id: 'sample-2',
    question: 'Should colleges replace traditional exams with practical project portfolios?',
    category: 'education',
    creator_name: 'Prof. Ananya Roy',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: 'active',
    total_votes: 518,
    options: [
      { id: 'opt-1', text: 'Yes, 100% project & git-based', votes: 310 },
      { id: 'opt-2', text: 'Hybrid 50/50 balance', votes: 172 },
      { id: 'opt-3', text: 'No, exams test foundational theory', votes: 36 },
    ],
  },
  {
    id: 'sample-3',
    question: 'Will Autonomous AI Coding Agents replace junior developers by 2028?',
    category: 'technology',
    creator_name: 'Siddharth Rao',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'active',
    total_votes: 689,
    options: [
      { id: 'opt-1', text: 'No, they will augment and 10x engineers', votes: 412 },
      { id: 'opt-2', text: 'Yes, entry-level headcount will shrink', votes: 198 },
      { id: 'opt-3', text: 'Unsure / Too early to predict', votes: 79 },
    ],
  },
  {
    id: 'sample-4',
    question: 'Who will win the ICC Cricket World Trophy this season?',
    category: 'sports',
    creator_name: 'Rahul K.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 6).toISOString(),
    status: 'active',
    total_votes: 420,
    options: [
      { id: 'opt-1', text: 'India', votes: 240 },
      { id: 'opt-2', text: 'Australia', votes: 110 },
      { id: 'opt-3', text: 'England', votes: 45 },
      { id: 'opt-4', text: 'South Africa', votes: 25 },
    ],
  },
  {
    id: 'sample-5',
    question: 'What is your preferred state management tool in modern React apps?',
    category: 'technology',
    creator_name: 'Maya Lin',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'active',
    total_votes: 215,
    options: [
      { id: 'opt-1', text: 'Zustand', votes: 105 },
      { id: 'opt-2', text: 'React Context API', votes: 60 },
      { id: 'opt-3', text: 'Redux Toolkit', votes: 38 },
      { id: 'opt-4', text: 'TanStack Query', votes: 12 },
    ],
  },
  {
    id: 'sample-6',
    question: 'What is the most anticipated movie or entertainment release this year?',
    category: 'entertainment',
    creator_name: 'Karan J.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 8).toISOString(),
    status: 'active',
    total_votes: 194,
    options: [
      { id: 'opt-1', text: 'Grand Theft Auto VI', votes: 112 },
      { id: 'opt-2', text: 'Spider-Man: Beyond the Spider-Verse', votes: 52 },
      { id: 'opt-3', text: 'Dune: Part Three', votes: 30 },
    ],
  },
]

// Also map 'poll-trend-X' aliases to sample polls
export const getFeaturedPollById = (id) => {
  if (!id) return null

  // Direct match
  let found = FEATURED_POLLS.find((p) => p.id === id)

  // Alias match for poll-trend-1, 2, etc.
  if (!found && id.startsWith('poll-trend-')) {
    const num = id.replace('poll-trend-', '')
    found = FEATURED_POLLS.find((p) => p.id === `sample-${num}`) || FEATURED_POLLS[0]
  }

  if (!found) return null

  // Retrieve any cached local votes from localStorage
  const localVotesKey = `pollsphere_vote_${id}`
  const userVotedOptionId = localStorage.getItem(localVotesKey)

  // Calculate results structure matching API schema
  let options = [...found.options]
  let totalVotes = found.total_votes

  // If user voted locally on this machine, add 1 to that option
  if (userVotedOptionId) {
    const optIndex = options.findIndex((o) => o.id === userVotedOptionId)
    if (optIndex !== -1) {
      options[optIndex] = { ...options[optIndex], votes: options[optIndex].votes + 1 }
      totalVotes += 1
    }
  }

  const resultsList = options.map((opt) => ({
    optionId: opt.id,
    optionText: opt.text,
    count: opt.votes,
    percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
  }))

  const pollData = {
    ...found,
    id: id,
    total_votes: totalVotes,
    options: options.map((opt) => ({ id: opt.id, text: opt.text })),
  }

  const resultsData = {
    pollId: id,
    totalVotes,
    results: resultsList,
    userVotedOptionId: userVotedOptionId || null,
  }

  return { poll: pollData, results: resultsData }
}

export const castFeaturedVote = (id, optionId) => {
  const localVotesKey = `pollsphere_vote_${id}`
  localStorage.setItem(localVotesKey, optionId)
  return getFeaturedPollById(id)
}
