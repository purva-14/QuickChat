// Populates the database with sample users AND a full web of conversations
// between every pair of them, so no matter which account you log into,
// every contact in the sidebar already has message history.
//
// Usage:
//   node seed.js          -> adds users/messages (skips users & pairs that already exist)
//   node seed.js --reset  -> WIPES all users + messages first, then reseeds from scratch

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Message = require("./models/Message");

const SAMPLE_PASSWORD = "password123"; // same password for every seeded user, for easy testing

const usersData = [
  { fullName: "John Johnson", username: "john.johnson", email: "john@quickchat.test", bio: "Hi Everyone, I am using QuickChat" },
  { fullName: "Michael Brown", username: "michael.brown", email: "michael@quickchat.test", bio: "Living life one message at a time" },
  { fullName: "William Jones", username: "william.jones", email: "william@quickchat.test", bio: "Coffee first, chat second" },
  { fullName: "Liam Stone", username: "liam.stone", email: "liam@quickchat.test", bio: "On QuickChat" },
  { fullName: "Noah Kites", username: "noah.kites", email: "noah@quickchat.test", bio: "Available" },
  { fullName: "Oliver Bean", username: "oliver.bean", email: "oliver@quickchat.test", bio: "Busy building things" },
  { fullName: "James Cook", username: "james.cook", email: "james@quickchat.test", bio: "Exploring new horizons" },
];

// Several distinct conversation templates so different pairs don't feel copy-pasted.
// "from: 0" = first user in the pair sends it, "from: 1" = second user in the pair sends it.
const templates = [
  [
    { from: 0, text: "Hey! Long time no chat, how's it going?" },
    { from: 1, text: "Doing good man, just been busy with work. You?" },
    { from: 0, text: "Same here, things have been hectic lately" },
    { from: 1, text: "We should catch up properly sometime" },
    { from: 0, text: "Definitely, are you free this weekend?" },
    { from: 1, text: "Yeah I think so, let's plan something" },
    { from: 0, text: "Awesome, I'll ping you Friday to confirm" },
    { from: 1, text: "Sounds good" },
  ],
  [
    { from: 0, text: "Did you check out the new QuickChat update?" },
    { from: 1, text: "Yeah just tried it, the neon theme looks amazing" },
    { from: 0, text: "Right? The read receipts are so smooth too" },
    { from: 1, text: "And the reactions feature is a nice touch" },
    { from: 0, text: "Try sending an image, it looks great in dark mode" },
    { from: 1, text: "On it, testing now" },
    { from: 0, text: "Let me know what you think" },
  ],
  [
    { from: 0, text: "Are you joining the meeting tomorrow?" },
    { from: 1, text: "Yeah, what time is it again?" },
    { from: 0, text: "10 AM, I'll send the link shortly" },
    { from: 1, text: "Perfect, thanks for the heads up" },
    { from: 0, text: "No problem, see you there" },
    { from: 1, text: "See you then!" },
  ],
  [
    { from: 0, text: "Lunch today?" },
    { from: 1, text: "I'm down, what are you thinking?" },
    { from: 0, text: "Maybe that new place downtown?" },
    { from: 1, text: "Sounds great, what time?" },
    { from: 0, text: "1pm work for you?" },
    { from: 1, text: "Perfect, see you then" },
    { from: 0, text: "Great, see you soon" },
  ],
  [
    { from: 0, text: "Quick question about the project" },
    { from: 1, text: "Sure, what's up?" },
    { from: 0, text: "Do you have the latest files?" },
    { from: 1, text: "Yeah I'll send them over now" },
    { from: 0, text: "Appreciate it" },
    { from: 1, text: "No worries, let me know if you need anything else" },
    { from: 0, text: "Will do, thanks again" },
  ],
  [
    { from: 0, text: "Happy Friday! Any weekend plans?" },
    { from: 1, text: "Thinking of hiking, you?" },
    { from: 0, text: "Nice, I might just relax at home this time" },
    { from: 1, text: "Fair enough, sounds like a good plan too" },
    { from: 0, text: "Enjoy the hike, send pics if you remember" },
    { from: 1, text: "Will do!" },
  ],
];

const emojiPool = ["❤️", "😂", "👍", "🔥", "😮"];

const seedUsers = async () => {
  const created = [];
  for (const u of usersData) {
    const existing = await User.findOne({ username: u.username });
    if (existing) {
      console.log(`Skipping user (already exists): ${u.username}`);
      created.push(existing);
      continue;
    }
    const user = await User.create({ ...u, password: SAMPLE_PASSWORD });
    created.push(user);
    console.log(`Created user: ${u.username}`);
  }
  return created;
};

const seedConversationForPair = async (userA, userB, templateIndex, spanIndex) => {
  const existingCount = await Message.countDocuments({
    $or: [
      { sender: userA._id, receiver: userB._id },
      { sender: userB._id, receiver: userA._id },
    ],
  });

  if (existingCount > 0) {
    console.log(`  Skipping ${userA.username} <-> ${userB.username} (already has ${existingCount} messages)`);
    return 0;
  }

  const template = templates[templateIndex % templates.length];
  const now = Date.now();

  // Vary how far back each pair's conversation starts (1 to 3 days ago) so
  // timestamps look natural instead of every thread happening at once.
  const totalMinutesSpan = 60 * 24 * (1 + (spanIndex % 3));
  const step = totalMinutesSpan / template.length;

  const docs = template.map((line, idx) => {
    const sender = line.from === 0 ? userA : userB;
    const receiver = line.from === 0 ? userB : userA;
    const minutesAgo = totalMinutesSpan - step * idx;
    const createdAt = new Date(now - minutesAgo * 60 * 1000);
    const isLast = idx === template.length - 1;

    return {
      _id: new mongoose.Types.ObjectId(),
      sender: sender._id,
      receiver: receiver._id,
      text: line.text,
      image: "",
      replyTo: null,
      status: isLast ? "delivered" : "seen",
      reactions:
        Math.random() < 0.25
          ? [{ user: receiver._id, emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)] }]
          : [],
      createdAt,
      updatedAt: createdAt,
    };
  });

  // Insert directly through the native driver so we can control createdAt exactly
  // (Mongoose's timestamps plugin would otherwise overwrite it with "now").
  await Message.collection.insertMany(docs);
  console.log(`  Seeded ${docs.length} messages: ${userA.username} <-> ${userB.username}`);
  return docs.length;
};

const run = async () => {
  const isReset = process.argv.includes("--reset");
  await connectDB();

  if (isReset) {
    console.log("Resetting: wiping existing users and messages...");
    await User.deleteMany({});
    await Message.deleteMany({});
  }

  console.log("\nSeeding users...");
  const users = await seedUsers();

  // Build every unique pair (21 pairs for 7 users) so every contact list
  // is fully populated with a conversation, no matter who logs in.
  const pairs = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      pairs.push([users[i], users[j]]);
    }
  }

  console.log(`\nSeeding conversations for ${pairs.length} contact pairs...`);
  let totalMessages = 0;
  for (let p = 0; p < pairs.length; p++) {
    const [userA, userB] = pairs[p];
    totalMessages += await seedConversationForPair(userA, userB, p, p);
  }

  console.log("\nSeed complete!");
  console.log("--------------------------------------------------");
  console.log(`Users: ${users.length}`);
  console.log(`Conversations: ${pairs.length}`);
  console.log(`Messages: ${totalMessages}`);
  console.log("--------------------------------------------------");
  console.log("Login with any seeded user, e.g.:");
  console.log("  username: john.johnson");
  console.log(`  password: ${SAMPLE_PASSWORD}`);
  console.log("Every account will see all other contacts with full chat history.");
  console.log("--------------------------------------------------");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});