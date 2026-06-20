const scenarios = {
  allowed: {
    title: "Allowed Action",
    badge: "allowed",
    badgeClass: "ready",
    intent: "swap 0.3 SUI through cetus-sim",
    digest: "5d01d64eb4479e8285f7968fc15f48444001deb42a86565432e42d6e7b13f312",
    checks: [
      ["policy_active", true, "Policy status is active."],
      ["policy_not_expired", true, "Policy is valid through the submission window."],
      ["agent_match", true, "Intent actor matches delegated agent."],
      ["protocol_allowed", true, "cetus-sim is allowlisted."],
      ["recipient_allowed", true, "Recipient is allowlisted."],
      ["per_action_cap", true, "0.3 SUI is below the 0.5 SUI cap."],
      ["daily_cap", true, "Daily spend remains below 1.5 SUI."],
      ["reserve_floor", true, "Wallet keeps required reserve."],
      ["risk_score", true, "Risk score is 22 / 40."]
    ]
  },
  blocked: {
    title: "Blocked Oversized Action",
    badge: "blocked",
    badgeClass: "blocked",
    intent: "swap 1.2 SUI through cetus-sim",
    digest: "2ac0ef49a0ed62f2a3cd40fa78a914d3b530c2d193f3b9136c50a8b094ffc3dc",
    checks: [
      ["policy_active", true, "Policy status is active."],
      ["policy_not_expired", true, "Policy is valid through the submission window."],
      ["agent_match", true, "Intent actor matches delegated agent."],
      ["protocol_allowed", true, "cetus-sim is allowlisted."],
      ["recipient_allowed", true, "Recipient is allowlisted."],
      ["per_action_cap", false, "1.2 SUI exceeds the 0.5 SUI cap."],
      ["daily_cap", true, "Daily spend still fits the daily cap."],
      ["reserve_floor", true, "Wallet keeps required reserve."],
      ["risk_score", false, "Risk score is 63 / 40."]
    ]
  },
  paused: {
    title: "Paused Policy Failure",
    badge: "paused",
    badgeClass: "blocked",
    intent: "retry swap 0.3 SUI after owner pause",
    digest: "2ed488b6830436ce65a5d1a450d26243e6ba8bb3e5b9cf7f14e75c0b1d0cdc52",
    checks: [
      ["policy_active", false, "Owner paused the policy."],
      ["policy_not_expired", true, "Policy is not expired."],
      ["agent_match", true, "Intent actor matches delegated agent."],
      ["protocol_allowed", true, "cetus-sim is allowlisted."],
      ["recipient_allowed", true, "Recipient is allowlisted."],
      ["per_action_cap", true, "0.3 SUI is below the 0.5 SUI cap."],
      ["daily_cap", true, "Daily spend remains below 1.5 SUI."],
      ["reserve_floor", true, "Wallet keeps required reserve."],
      ["risk_score", true, "Risk score is 22 / 40."]
    ]
  }
};

const chainEvidence = {
  packageId: "0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4",
  policyObject: "0x05890c9882df3a77bc6389bd895227f86343a2b7a3b48deb0c72a9ff76bb0f3c",
  publishTx: "4AMeu8oNd93wZ97C5mZvwDT8Sv8eN1sAfYz48YV9tYBJ",
  actionTx: "S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9",
  pauseTx: "55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC",
  blockedTx: "AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa",
  walrusBlobId: "IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU",
  walrusBlobObject: "0x4e07753366b797e96754d6b00fae4e28b903b4558ecd0c8a213d07b3cf89e059"
};

const buttons = [...document.querySelectorAll("[data-scenario]")];
const title = document.querySelector("#scenarioTitle");
const badge = document.querySelector("#scenarioBadge");
const intentText = document.querySelector("#intentText");
const checkGrid = document.querySelector("#checkGrid");
const receiptDigest = document.querySelector("#receiptDigest");
const copyDigest = document.querySelector("#copyDigest");

document.querySelector("#allowedDigest").textContent = `${scenarios.allowed.digest.slice(0, 8)}...`;
document.querySelector("#blockedDigest").textContent = `${scenarios.blocked.digest.slice(0, 8)}...`;
document.querySelector("#pauseDigest").textContent = `${scenarios.paused.digest.slice(0, 8)}...`;

for (const button of buttons) {
  button.addEventListener("click", () => renderScenario(button.dataset.scenario));
}

copyDigest.addEventListener("click", async () => {
  await navigator.clipboard.writeText(receiptDigest.textContent);
  copyDigest.textContent = "Copied";
  setTimeout(() => {
    copyDigest.textContent = "Copy";
  }, 1200);
});

renderScenario("allowed");

function renderScenario(key) {
  const scenario = scenarios[key];
  title.textContent = scenario.title;
  badge.textContent = scenario.badge;
  badge.className = `status ${scenario.badgeClass}`;
  intentText.textContent = scenario.intent;
  receiptDigest.textContent = scenario.digest;

  for (const button of buttons) {
    button.classList.toggle("active", button.dataset.scenario === key);
  }

  checkGrid.replaceChildren(
    ...scenario.checks.map(([name, pass, detail]) => {
      const item = document.createElement("article");
      item.className = `check ${pass ? "pass" : "fail"}`;
      item.innerHTML = `<strong>${pass ? "PASS" : "FAIL"} · ${name}</strong><span>${detail}</span>`;
      return item;
    })
  );
}
