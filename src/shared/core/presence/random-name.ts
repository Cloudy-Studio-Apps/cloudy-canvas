const ADJECTIVES = [
  "Sunny",
  "Curious",
  "Sleepy",
  "Brave",
  "Gentle",
  "Happy",
  "Quiet",
  "Swift",
  "Clever",
  "Cozy",
  "Fluffy",
  "Lucky",
  "Jolly",
  "Calm",
  "Bold",
  "Witty",
  "Merry",
  "Snowy",
  "Breezy",
  "Misty",
];

const ANIMALS = [
  "Seal",
  "Otter",
  "Penguin",
  "Puffin",
  "Walrus",
  "Dolphin",
  "Orca",
  "Narwhal",
  "Manatee",
  "Beluga",
  "Pelican",
  "Turtle",
  "Octopus",
  "Starfish",
  "Seahorse",
  "Gull",
  "Lobster",
  "Crab",
  "Whale",
  "Squid",
];

/** A friendly name to start with ("Sleepy Puffin"), until the person picks their own. */
export function randomPersonName(): string {
  return `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
}

function pick(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)] ?? words[0] ?? "";
}
