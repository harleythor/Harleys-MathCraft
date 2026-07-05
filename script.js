let equation = [];
let inventory = {};
let craftedInventory = {};
let craftingSlots = [];
let mathPoints = 0;
let advancedUnlocked = false;

const MAX_STACK = 64;

function addSymbol(symbol) {
  equation.push(symbol);
  updateDisplay();
}

function updateDisplay() {
  const display = document.getElementById("display");

  if (equation.length === 0) {
    display.textContent = "Build your equation...";
  } else {
    display.textContent = equation.join(" ");
  }
}

function clearEquation() {
  equation = [];
  updateDisplay();
  document.getElementById("equationBlocks").innerHTML = "";
}

function buildEquation() {
  const blockArea = document.getElementById("equationBlocks");
  blockArea.innerHTML = "";

  equation.forEach(symbol => {
    createEquationBlock(symbol, "block");
  });

  const answer = calculateAnswer();

  if (answer === "TOO_BIG") {
    createEquationBlock("Number too big", "error-block");
    createEquationBlock("Unable to show all numbers", "error-block");
    return;
  }

  if (answer !== null) {
    createEquationBlock("=", "equals-block");
    createEquationBlock(answer, "answer-block");
  } else {
    createEquationBlock("?", "error-block");
  }
}

function createEquationBlock(symbol, className) {
  const blockArea = document.getElementById("equationBlocks");

  const block = document.createElement("div");
  block.className = className;
  block.textContent = symbol;

  block.onclick = function() {
    addToInventory(symbol);
  };

  blockArea.appendChild(block);
}

function addToInventory(symbol, amount = 1) {
  if (inventory[symbol]) {
    inventory[symbol] += amount;
  } else {
    inventory[symbol] = amount;
  }

  updateInventory();
}

function updateInventory() {
  const inventoryArea = document.getElementById("inventory");
  inventoryArea.innerHTML = "";

  for (let symbol in inventory) {
    const total = inventory[symbol];
    const stacks = makeStacks(total);

    stacks.forEach(stackAmount => {
      const item = document.createElement("div");
      item.className = "item";

      if (stackAmount === 1) {
        item.textContent = symbol;
      } else {
        item.textContent = symbol + " × " + stackAmount;
      }

      item.onclick = function() {
        addToCrafting(symbol);
      };

      inventoryArea.appendChild(item);
    });
  }
}

function makeStacks(total) {
  let stacks = [];

  while (total > MAX_STACK) {
    stacks.push(MAX_STACK);
    total -= MAX_STACK;
  }

  if (total > 0) {
    stacks.push(total);
  }

  return stacks;
}

function addToCrafting(symbol) {
  if (craftingSlots.length >= 2) {
    alert("The crafting table is full!");
    return;
  }

  if (!inventory[symbol] || inventory[symbol] <= 0) {
    alert("You do not have that item!");
    return;
  }

  inventory[symbol]--;

  if (inventory[symbol] === 0) {
    delete inventory[symbol];
  }

  craftingSlots.push(symbol);

  updateInventory();
  updateCraftingSlots();
}

function updateCraftingSlots() {
  for (let i = 0; i < 2; i++) {
    const slot = document.getElementById("slot" + i);

    if (craftingSlots[i]) {
      slot.textContent = craftingSlots[i];
    } else {
      slot.textContent = "";
    }
  }
}

function clearCrafting() {
  craftingSlots.forEach(symbol => {
    addToInventory(symbol);
  });

  craftingSlots = [];
  updateCraftingSlots();
}

function craftItem() {
  if (craftingSlots.length !== 2) {
    alert("You need exactly 2 items to craft!");
    return;
  }

  const first = craftingSlots[0];
  const second = craftingSlots[1];

  // Recipe: √ + 4 = Square Root of 4
  if (matchesRecipe(first, second, "√", "4")) {
    finishCrafting("Square Root of 4");
    return;
  }

  // Recipe: 4 + 7 = 50% Eleven Wand, 50% Number 11 Item
  if (matchesRecipe(first, second, "4", "7")) {
    const randomNumber = Math.random();

    if (randomNumber < 0.5) {
      finishCrafting("Eleven Wand");
    } else {
      finishCrafting("Number 11 Item");
    }

    return;
  }

  // Recipe: ÷ + ÷ = Fraction Symbol + 5 points
  if (matchesRecipe(first, second, "÷", "÷")) {
    finishCrafting("Fraction Symbol");
    addPoints(5);
    return;
  }

  // Recipe: ∞ + ∞ = Infinity Core
  if (matchesRecipe(first, second, "∞", "∞")) {
    finishCrafting("Infinity Core");
    unlockAdvancedPanel();
    return;
  }

  // Recipe: ? + ? = Question Mark Block
  if (matchesRecipe(first, second, "?", "?")) {
    finishCrafting("Question Mark Block");
    return;
  }

  // Recipe: + + + = Bigger Crafting Table idea, but for now two pluses unlocks 4x4 table
  if (matchesRecipe(first, second, "+", "+")) {
    finishCrafting("4x4 Crafting Table");
    return;
  }

  alert("No recipe found yet!");
}

function matchesRecipe(first, second, itemA, itemB) {
  return (
    (first === itemA && second === itemB) ||
    (first === itemB && second === itemA)
  );
}

function finishCrafting(craftedItemName) {
  addCraftedItem(craftedItemName);
  craftingSlots = [];
  updateCraftingSlots();
}

function addCraftedItem(name, amount = 1) {
  if (craftedInventory[name]) {
    craftedInventory[name] += amount;
  } else {
    craftedInventory[name] = amount;
  }

  updateCraftedItems();
}

function updateCraftedItems() {
  const craftedArea = document.getElementById("craftedItems");
  craftedArea.innerHTML = "";

  for (let name in craftedInventory) {
    const total = craftedInventory[name];
    const stacks = makeStacks(total);

    stacks.forEach(stackAmount => {
      const item = document.createElement("div");
      item.className = "crafted-item";

      if (stackAmount === 1) {
        item.textContent = name;
      } else {
        item.textContent = name + " × " + stackAmount;
      }

      item.onclick = function() {
        useCraftedItem(name);
      };

      craftedArea.appendChild(item);
    });
  }
}

function useCraftedItem(name) {
  if (!craftedInventory[name] || craftedInventory[name] <= 0) {
    alert("You do not have that crafted item!");
    return;
  }

  if (name === "Square Root of 4") {
    const operators = ["+", "-", "×", "÷"];
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];

    alert("Square Root of 4 created a " + randomOperator + " symbol!");
    addToInventory(randomOperator);
    removeCraftedItem(name);
    return;
  }

  if (name === "Infinity Core") {
    unlockAdvancedPanel();
    alert("Infinity Core unlocked the Advanced Math Panel!");
    return;
  }

  if (name === "Question Mark Block") {
    removeCraftedItem(name);

    const specialItems = [
      "Mystery Crystal",
      "Chaos Number",
      "Hidden Symbol",
      "Secret Equation Piece",
      "Unknown Core"
    ];

    const randomItem = specialItems[Math.floor(Math.random() * specialItems.length)];

    alert("The Question Mark Block opened and gave you: " + randomItem);
    addCraftedItem(randomItem);
    return;
  }

  if (name === "Eleven Wand") {
    alert("Eleven Wand gives you 11 math points!");
    addPoints(11);
    return;
  }

  if (name === "Unknown Core") {
  alert("Unknown Core unlocked the Secret Equation Panel!");
  unlockSecretPanel();
  removeCraftedItem(name);
  return;
}

if (name === "Secret Equation Piece") {
  alert("Secret Equation Piece gave you 10 math points!");
  addPoints(10);
  removeCraftedItem(name);
  return;
}

  if (name === "Fraction Symbol") {
    alert("Fraction Symbol unlocked fraction thinking!");
    addPoints(5);
    return;
  }

  alert(name + " does not have a use yet.");
}

function useCraftedItem(name) {
  if (!craftedInventory[name] || craftedInventory[name] <= 0) {
    alert("You do not have that crafted item!");
    return;
  }

  if (name === "Square Root of 4") {
    const operators = ["+", "-", "×", "÷"];
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];

    alert("Square Root of 4 created a " + randomOperator + " symbol!");
    addToInventory(randomOperator);
    removeCraftedItem(name);
    return;
  }

  if (name === "Infinity Core") {
    unlockAdvancedPanel();
    alert("Infinity Core unlocked the Advanced Math Panel!");
    return;
  }

  if (name === "Question Mark Block") {
    removeCraftedItem(name);

    const specialItems = [
      "Mystery Crystal",
      "Chaos Number",
      "Hidden Symbol",
      "Secret Equation Piece",
      "Unknown Core"
    ];

    const randomItem = specialItems[Math.floor(Math.random() * specialItems.length)];

    alert("Mystery reward unlocked: " + randomItem + "!");
    addCraftedItem(randomItem);
    return;
  }

  if (name === "Unknown Core") {
    alert("Unknown Core unlocked the Secret Equation Panel!");
    unlockSecretPanel();
    removeCraftedItem(name);
    return;
  }

  if (name === "Secret Equation Piece") {
    alert("Secret Equation Piece unlocked secret maths and gave you 10 points!");
    unlockSecretPanel();
    addPoints(10);
    removeCraftedItem(name);
    return;
  }

  if (name === "Chaos Number") {
    const randomNumber = Math.floor(Math.random() * 100);

    alert("Chaos Number exploded into number " + randomNumber + "!");
    addToInventory(String(randomNumber));
    removeCraftedItem(name);
    return;
  }

  if (name === "Hidden Symbol") {
    const hiddenSymbols = ["π", "∞", "^", ".", "/", "Δ", "θ", "Σ", "Ω"];
    const randomSymbol = hiddenSymbols[Math.floor(Math.random() * hiddenSymbols.length)];

    alert("Hidden Symbol revealed: " + randomSymbol);
    addToInventory(randomSymbol);
    removeCraftedItem(name);
    return;
  }

  if (name === "Mystery Crystal") {
    const crystalSymbols = ["√", "+", "-", "×", "÷", "π", "∞"];
    const randomSymbol = crystalSymbols[Math.floor(Math.random() * crystalSymbols.length)];

    alert("Mystery Crystal gave you 25 points and a " + randomSymbol + " symbol!");
    addPoints(25);
    addToInventory(randomSymbol);
    removeCraftedItem(name);
    return;
  }

  if (name === "Eleven Wand") {
    alert("Eleven Wand gives you 11 math points!");
    addPoints(11);
    return;
  }

  if (name === "Fraction Symbol") {
    alert("Fraction Symbol unlocked fraction thinking!");
    addPoints(5);
    return;
  }

  alert(name + " does not have a use yet.");
}

function removeCraftedItem(name) {
  craftedInventory[name]--;

  if (craftedInventory[name] === 0) {
    delete craftedInventory[name];
  }

  updateCraftedItems();
}

function addPoints(amount) {
  mathPoints += amount;
  updatePoints();
}

function updatePoints() {
  const pointsDisplay = document.getElementById("pointsDisplay");
  pointsDisplay.textContent = "Points: " + mathPoints;
}

function unlockAdvancedPanel() {
  advancedUnlocked = true;

  const title = document.getElementById("advancedTitle");
  const panel = document.getElementById("advancedPanel");

  if (title && panel) {
    title.style.display = "block";
    panel.style.display = "block";
  }
}

function unlockSecretPanel() {
  const title = document.getElementById("secretTitle");
  const panel = document.getElementById("secretPanel");

  if (title && panel) {
    title.style.display = "block";
    panel.style.display = "block";
  }
}

function calculateAnswer() {
  if (equation.length === 0) {
    return null;
  }

  const expressionText = equation.join("");

  try {
    const tokens = tokenizeExpression(expressionText);
    const answer = evaluateExpression(tokens);

    if (answer === Infinity || answer === "∞") {
      return "∞";
    }

    if (answer === -Infinity) {
      return "-∞";
    }

    if (isNaN(answer)) {
      return null;
    }

    if (Math.abs(answer) > 999999999999) {
      return "TOO_BIG";
    }

    return roundAnswer(answer);
  } catch (error) {
    return null;
  }
}

function tokenizeExpression(text) {
  const tokens = [];
  let number = "";

  for (let i = 0; i < text.length; i++) {
    const character = text[i];

    if (isDigit(character) || character === ".") {
      number += character;
      continue;
    }

    if (number !== "") {
      tokens.push(Number(number));
      number = "";
    }

    if (character === "π") {
      tokens.push(Math.PI);
      continue;
    }

    if (
      character === "√" ||
      character === "+" ||
      character === "-" ||
      character === "×" ||
      character === "÷" ||
      character === "^" ||
      character === "(" ||
      character === ")"
    ) {
      tokens.push(character);
      continue;
    }

    return [];
  }

  if (number !== "") {
    tokens.push(Number(number));
  }

  return handleNegativeNumbers(tokens);
}

function isDigit(character) {
  return character >= "0" && character <= "9";
}

function handleNegativeNumbers(tokens) {
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (
      token === "-" &&
      (
        i === 0 ||
        tokens[i - 1] === "(" ||
        tokens[i - 1] === "+" ||
        tokens[i - 1] === "-" ||
        tokens[i - 1] === "×" ||
        tokens[i - 1] === "÷" ||
        tokens[i - 1] === "^"
      ) &&
      typeof tokens[i + 1] === "number"
    ) {
      result.push(-tokens[i + 1]);
      i++;
    } else {
      result.push(token);
    }
  }

  return result;
}

function evaluateExpression(tokens) {
  tokens = solveParentheses(tokens);

  if (tokens.length === 0) {
    return NaN;
  }

  tokens = solveSquareRoots(tokens);
  tokens = solveOperators(tokens, ["^"]);
  tokens = solveOperators(tokens, ["×", "÷"]);
  tokens = solveOperators(tokens, ["+", "-"]);

  if (tokens.length === 1 && typeof tokens[0] === "number") {
    return tokens[0];
  }

  return NaN;
}

function solveParentheses(tokens) {
  let newTokens = [...tokens];

  while (newTokens.includes("(")) {
    let openIndex = -1;
    let closeIndex = -1;

    for (let i = 0; i < newTokens.length; i++) {
      if (newTokens[i] === "(") {
        openIndex = i;
      }

      if (newTokens[i] === ")" && openIndex !== -1) {
        closeIndex = i;
        break;
      }
    }

    if (openIndex === -1 || closeIndex === -1) {
      return [];
    }

    const insideTokens = newTokens.slice(openIndex + 1, closeIndex);
    const insideAnswer = evaluateExpression(insideTokens);

    if (isNaN(insideAnswer)) {
      return [];
    }

    newTokens.splice(openIndex, closeIndex - openIndex + 1, insideAnswer);
  }

  if (newTokens.includes(")")) {
    return [];
  }

  return newTokens;
}

function solveSquareRoots(tokens) {
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "√") {
      const nextNumber = tokens[i + 1];

      if (typeof nextNumber === "number") {
        result.push(Math.sqrt(nextNumber));
        i++;
      } else {
        return [];
      }
    } else {
      result.push(tokens[i]);
    }
  }

  return result;
}

function solveOperators(tokens, operatorsToSolve) {
  let newTokens = [...tokens];

  let i = 0;

  while (i < newTokens.length) {
    const token = newTokens[i];

    if (operatorsToSolve.includes(token)) {
      const left = newTokens[i - 1];
      const right = newTokens[i + 1];

      if (typeof left !== "number" || typeof right !== "number") {
        return [];
      }

      let answer;

      if (token === "^") {
        answer = Math.pow(left, right);
      }

      if (token === "×") {
        answer = left * right;
      }

      if (token === "÷") {
        if (right === 0) {
          answer = Infinity;
        } else {
          answer = left / right;
        }
      }

      if (token === "+") {
        answer = left + right;
      }

      if (token === "-") {
        answer = left - right;
      }

      newTokens.splice(i - 1, 3, answer);
      i = 0;
    } else {
      i++;
    }
  }

  return newTokens;
}

function roundAnswer(number) {
  return Math.round(number * 1000000) / 1000000;
}

function tokenizeExpression(text) {
  const tokens = [];
  let number = "";

  for (let i = 0; i < text.length; i++) {
    const character = text[i];

    if (isDigit(character) || character === ".") {
      number += character;
      continue;
    }

    if (number !== "") {
      tokens.push(Number(number));
      number = "";
    }

    if (character === "π") {
      tokens.push(Math.PI);
      continue;
    }

    if (character === "√") {
      tokens.push("√");
      continue;
    }

    if (character === "+" || character === "-" || character === "×" || character === "÷" || character === "^") {
      tokens.push(character);
      continue;
    }

    return [];
  }

  if (number !== "") {
    tokens.push(Number(number));
  }

  return tokens;
}

function isDigit(character) {
  return character >= "0" && character <= "9";
}

function evaluateTokens(tokens) {
  if (tokens.length === 0) {
    return NaN;
  }

  // First: square roots
  tokens = solveSquareRoots(tokens);

  // Second: powers
  tokens = solveOperators(tokens, ["^"]);

  // Third: multiplication and division
  tokens = solveOperators(tokens, ["×", "÷"]);

  // Fourth: addition and subtraction
  tokens = solveOperators(tokens, ["+", "-"]);

  if (tokens.length === 1 && typeof tokens[0] === "number") {
    return tokens[0];
  }

  return NaN;
}

function solveSquareRoots(tokens) {
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "√") {
      const nextNumber = tokens[i + 1];

      if (typeof nextNumber === "number") {
        result.push(Math.sqrt(nextNumber));
        i++;
      } else {
        return [];
      }
    } else {
      result.push(tokens[i]);
    }
  }

  return result;
}

function solveOperators(tokens, operatorsToSolve) {
  let newTokens = [...tokens];

  let i = 0;

  while (i < newTokens.length) {
    const token = newTokens[i];

    if (operatorsToSolve.includes(token)) {
      const left = newTokens[i - 1];
      const right = newTokens[i + 1];

      if (typeof left !== "number" || typeof right !== "number") {
        return [];
      }

      let answer;

      if (token === "^") {
        answer = Math.pow(left, right);
      }

      if (token === "×") {
        answer = left * right;
      }

      if (token === "÷") {
        if (right === 0) {
          answer = Infinity;
        } else {
          answer = left / right;
        }
      }

      if (token === "+") {
        answer = left + right;
      }

      if (token === "-") {
        answer = left - right;
      }

      newTokens.splice(i - 1, 3, answer);
      i = 0;
    } else {
      i++;
    }
  }

  return newTokens;
}

function roundAnswer(number) {
  return Math.round(number * 1000000) / 1000000;
}