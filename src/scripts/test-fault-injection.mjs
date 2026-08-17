const failures = [];
const fail = (message) => failures.push(message);

function oracle(value, expected) {
  if (value !== expected) throw new Error(`expected ${expected}, got ${value}`);
}

const mutations = [
  { name: "wrong-scalar", run: () => oracle(5, 4) },
  { name: "wrong-count", run: () => oracle([1, 2, 3].length, 2) },
  { name: "wrong-content", run: () => oracle(Buffer.from("bad").equals(Buffer.from("good")), true) },
  { name: "wrong-order", run: () => oracle(JSON.stringify(["b", "a"]), JSON.stringify(["a", "b"])) },
  { name: "wrong-size", run: () => oracle(10, 11) },
];

for (const mutation of mutations) {
  let rejected = false;
  try {
    mutation.run();
  } catch {
    rejected = true;
  }
  if (!rejected) fail(`Oracle did not reject injected fault: ${mutation.name}`);
}

if (failures.length) {
  console.error("FAULT INJECTION CONTRACT: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("FAULT INJECTION CONTRACT: PASS (5 injected faults rejected)");
