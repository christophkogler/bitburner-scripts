/** @param {NS} ns */
import {easyRun} from '/easyRun.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
export async function main(ns) { 
  // manual usage: run cct-solver.js contractName contractHost
  
  let contractName = ns.args[0];
  let contractHost = ns.args[1];

  let contractType = await easyRun(ns, "codingcontract/getContractType", contractName, contractHost);

  let contractData = await easyRun(ns, "codingcontract/getData", contractName, contractHost);

  
  let description = await easyRun(ns, "codingcontract/getDescription", contractName, contractHost)

  let reward;
  let inputNumber;
  let inputArray;
  let defaulting = false;
  let response;
  let prices;
  let minPrice;
  let inputString;

  switch (contractType) { 
    case "Subarray with Maximum Sum": //------------------------------------------------------------------
      inputArray = contractData;

      let maxSum = inputArray[0];
      let currentSum = maxSum;

      for (let i = 1; i < inputArray.length; i++) {
        currentSum = Math.max(inputArray[i], currentSum + inputArray[i]);
        maxSum = Math.max(maxSum, currentSum);
      }
      
      reward = await easyRun(ns, "codingcontract/attempt", maxSum, contractName, contractHost);
      break;

    case "Find Largest Prime Factor": //------------------------------------------------------------------
      inputNumber = contractData;
      let largestPrimeFactor = 2; // Start with the smallest prime number
      while (inputNumber % 2 === 0 && inputNumber !== 0) { 
        largestPrimeFactor = 2; inputNumber /= 2; 
      }
      for (let factor = 3; factor <= Math.sqrt(inputNumber); factor += 2) {
        while (inputNumber % factor === 0 && inputNumber !== 0) { 
          largestPrimeFactor = factor; inputNumber /= factor; 
        }
      }
      if (inputNumber > 2) { largestPrimeFactor = inputNumber; }
      reward = await easyRun(ns, "codingcontract/attempt", largestPrimeFactor, contractName, contractHost);
      break;

    case "Total Ways to Sum": //------------------------------------------------------------------------
      inputNumber = contractData;
      //ns.tprint("Input Number: " + inputNumber); // Debug print for the input number
      let twtsArray = new Array(inputNumber + 1).fill(0);
      twtsArray[0] = 1; // There's one way to make 0, which is not using any number

      for (let i = 1; i < inputNumber; i++) { // Start from 1 as we need at least two numbers
        //ns.tprint("Processing number: " + i); // Debug print for each number being processed
        for (let j = i; j <= inputNumber; j++) {
          twtsArray[j] += twtsArray[j - i];
          //ns.tprint(`twtsArray[${j}]: ` + twtsArray[j]); // Debug print for array values
        }
      }
      let distinctSums = twtsArray[inputNumber]; // Subtract 1 to exclude the number itself
      //ns.tprint("Distinct Sums for " + inputNumber + ": " + distinctSums); // Final result

      reward = await easyRun(ns, "codingcontract/attempt", distinctSums, contractName, contractHost);
      break;

    case "Total Ways to Sum II": // ----------------------------------------------------------------------
      //ns.tprint(description)
      let targetNumber = contractData.shift();  // first entry is target
      //ns.tprint("Target Number: " + targetNumber); // Debug print for the target number
      let inputSet = contractData.shift(); // second is our input
      //ns.tprint("Input Set: " + inputSet.join(", ")); // Debug print for the input set
      let twts2Array = new Array(targetNumber + 1).fill(0); // Initialize the array
      twts2Array[0] = 1;

      for (let num of inputSet) {
        //ns.tprint("Processing number: " + num); // Debug print for each number being processed
        for (let sum = num; sum <= targetNumber; sum++) {
          twts2Array[sum] += twts2Array[sum - num];
          //ns.tprint(`twts2Array[${sum}]: ` + twts2Array[sum]); // Debug print for array values
        }
      }
      let distinctSummations = twts2Array[targetNumber];
      //ns.tprint("Distinct Summations for " + targetNumber + ": " + distinctSummations); // Final result
      reward = await easyRun(ns, "codingcontract/attempt", distinctSummations, contractName, contractHost);
      break;

    case "Spiralize Matrix": // ---------------------------------------------------------
      if (!Array.isArray(contractData) || contractData.some(row => !Array.isArray(row))) {
        ns.tprint("Invalid input: contractData must be a two-dimensional array."); break;
      }

      inputArray = contractData;
      let outputArray = [];

      while (inputArray.length > 0) {
        // Handle 'top' line
        let firstLine = inputArray.shift();
        outputArray.push(...firstLine);
        // Handle 'right edge' (if there are remaining rows)
        if (inputArray.length > 0) {
          inputArray.forEach(row => outputArray.push(row.pop()));
        }
        // Remove empty sub-arrays
        inputArray = inputArray.filter(row => row.length > 0);

        // Handle 'bottom' line (if there are remaining rows)
        if (inputArray.length > 0) {
          let lastLine = inputArray.pop();
          outputArray.push(...lastLine.reverse());
        }
        // Handle 'left edge' (if there are remaining rows)
        if (inputArray.length > 0) {
          for (let i = inputArray.length - 1; i >= 0; i--) {
            outputArray.push(inputArray[i].shift());
          }
        }
        // Remove empty sub-arrays
        inputArray = inputArray.filter(row => row.length > 0);
      }

      reward = await easyRun(ns, "codingcontract/attempt", JSON.stringify(outputArray), contractName, contractHost);
      break;

    case "Array Jumping Game": // --------------------------------------------------------------------------------

      function recursiveSearch(array, index = 0) {
        let maxJump = array[index]
        if (maxJump === 0 && index < array.length - 1) return false; // If we're at a position with 0 jump length and it's not the last element
        if (index + maxJump >= array.length - 1) return true; // Check if we can reach or exceed the end of the array from here
        for (let i = maxJump; i > 0; i--) { // Iterate through possible jumps, from the furthest to the nearest
          if (recursiveSearch(array, index + i)) { return true; } // Recurse from the new index
        }
        return false; // If none of the jumps lead to success, return false
      }

      inputArray = contractData;
      response = recursiveSearch(inputArray) ? 1:0;
      reward = await easyRun(ns, "codingcontract/attempt", response, contractName, contractHost);
      break;


    case "Array Jumping Game II": // -----------------------------------------------------------------------------

      function recursiveCountingSearch(array, index = 0, count = 0) {
        if (index >= array.length - 1) return count; // Reached or exceeded the end of the array
        let maxJump = array[index];
        if (maxJump === 0) return Infinity; // Cannot move further

        let minJumps = Infinity;
        for (let i = 1; i <= maxJump; i++) {
          let jumps = recursiveCountingSearch(array, index + i, count + 1);
          minJumps = Math.min(minJumps, jumps);
        }
        return minJumps;
      }

      inputArray = contractData;
      let minJumps = recursiveCountingSearch(inputArray);
      response = (minJumps === Infinity) ? 0 : minJumps; // If Infinity, it's impossible to reach the end
      reward = await easyRun(ns, "codingcontract/attempt", response, contractName, contractHost);
      break;

    case "Merge Overlapping Intervals":
      inputArray = contractData;
      //ns.tprint(`Input: ${JSON.stringify(inputArray)}`)
      inputArray.sort((a, b) => a[0] - b[0])
      //ns.tprint(`Post-sort: ${JSON.stringify(inputArray)}`)

      let merged = [];
      for (let i = 0; i < inputArray.length; i++) {
        if (merged.length === 0 || merged[merged.length - 1][1] < inputArray[i][0]) {
          // If there are no intervals in merged, or if the current interval does not overlap with the previous, simply add it.
          merged.push(inputArray[i]);
        } else {
          // Otherwise, there is an overlap, so we merge the current and previous intervals.
          merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], inputArray[i][1]);
        }
      }
      //ns.tprint(`Post-join: ${JSON.stringify(merged)}`)
      reward = await easyRun(ns, "codingcontract/attempt", JSON.stringify(merged), contractName, contractHost);
      break;

    case "Generate IP Addresses":

      function generateIPAddresses(inputString) {
        let validIPs = [];

        for (let i = 1; i < 4 && i < inputString.length - 2; i++) { // grab up to three chars, leaving chars for others
          for (let j = i + 1; j < i + 4 && j < inputString.length - 1; j++) { // up to 3 more, leaving chars for others
            for (let k = j + 1; k < j + 4 && k < inputString.length; k++) { // up to 3 more, leaving at LEAST 1 char for last
              let a = inputString.substring(0, i);
              let b = inputString.substring(i, j);
              let c = inputString.substring(j, k);
              let d = inputString.substring(k);

              if (isValidOctet(a) && isValidOctet(b) && isValidOctet(c) && isValidOctet(d)) {
                validIPs.push(a + "." + b + "." + c + "." + d);
              }
            }
          }
        }
        return validIPs;
      }

      function isValidOctet(octet) {
        if (octet.length > 3) return false;
        if (octet.startsWith("0") && octet.length > 1) return false;
        if (parseInt(octet) > 255) return false;
        return true;
      }

      inputString = contractData;
      let ipAddresses = generateIPAddresses(inputString);
      reward = await easyRun(ns, "codingcontract/attempt", JSON.stringify(ipAddresses), contractName, contractHost);

      break;

    case "Algorithmic Stock Trader I":
      // find the greatest difference between any two days, with the minimum being before the maximum
      prices = contractData; // Array of stock prices

      let maxProfit = 0; // Initialize maximum profit as 0
      minPrice = prices[0]; // Initialize minimum price as the first day's price

      for (let i = 1; i < prices.length; i++) {
        // Update minPrice if the current price is lower
        if (prices[i] < minPrice) {
          minPrice = prices[i];
        }

        // Calculate profit if the stock bought at minPrice is sold at current price
        let profit = prices[i] - minPrice;

        // Update maxProfit if the current profit is greater than the previously recorded maxProfit
        if (profit > maxProfit) {
          maxProfit = profit;
        }
      }

      reward = await easyRun(ns, "codingcontract/attempt", maxProfit, contractName, contractHost);

      break;

    case "Algorithmic Stock Trader II":
      prices = contractData; // Array of stock prices

      let totalProfit = 0; // Initialize total profit as 0

      for (let i = 1; i < prices.length; i++) {
        // If the price of the stock goes up the next day, buy yesterday and sell today
        if (prices[i] > prices[i - 1]) {
          totalProfit += prices[i] - prices[i - 1];
        }
      }
      //ns.tprint(totalProfit)
      reward = await easyRun(ns, "codingcontract/attempt", totalProfit, contractName, contractHost);

      break;

    case "Algorithmic Stock Trader III":
      prices = contractData; // Array of stock prices

      let n = prices.length;
      let maxProfitOneTransaction = new Array(n).fill(0);
      minPrice = prices[0];

      // First pass - forward traversal
      for (let i = 1; i < n; i++) {
        maxProfitOneTransaction[i] = Math.max(maxProfitOneTransaction[i - 1], prices[i] - minPrice);
        minPrice = Math.min(minPrice, prices[i]);
      }

      // Second pass - backward traversal
      let maxPrice = prices[n - 1];
      let maxProfitTwoTransactions = 0;
      let maxProfitAfterSecondTransaction = 0;

      for (let i = n - 2; i >= 0; i--) {
        maxProfitAfterSecondTransaction = Math.max(maxProfitAfterSecondTransaction, maxPrice - prices[i]);
        maxPrice = Math.max(maxPrice, prices[i]);
        maxProfitTwoTransactions = Math.max(maxProfitTwoTransactions, maxProfitAfterSecondTransaction + maxProfitOneTransaction[i]);
      }

      reward = await easyRun(ns, "codingcontract/attempt", maxProfitTwoTransactions, contractName, contractHost);
      break;

    case "Algorithmic Stock Trader IV":
      function maxProfitFunc(k, prices) {
        if (!prices.length) return 0;

        // If k is larger than half the number of days, it's the same as unlimited transactions.
        if (k >= prices.length / 2) {
            let profit = 0;
            for (let i = 1; i < prices.length; i++) {
              if (prices[i] > prices[i - 1]) {
                profit += prices[i] - prices[i - 1];
              }
            }
          return profit;
        }

        let dp = Array.from({length: k + 1}, () => new Array(prices.length).fill(0));
        for (let i = 1; i <= k; i++) {
          let maxDiff = -prices[0];
          for (let j = 1; j < prices.length; j++) {
            dp[i][j] = Math.max(dp[i][j - 1], prices[j] + maxDiff);
            maxDiff = Math.max(maxDiff, dp[i - 1][j] - prices[j]);
          }
        }
        return dp[k][prices.length - 1];
      }

      let [k, stockPrices] = contractData; // Assuming contractData is [k, [stockPrices]]
      let maxPossibleProfit = maxProfitFunc(k, stockPrices);
      //ns.tprint(maxPossibleProfit)
      reward = await easyRun(ns, "codingcontract/attempt", maxPossibleProfit, contractName, contractHost);
      break;

    case "Minimum Path Sum in a Triangle":
      inputArray = contractData;
      inputArray.reverse(); // inverted pyramid, helps my brain thinky

      for (let line = 1; line < inputArray.length; line++){ // for each row (starting at second-to-last), as we reach UP a row
        let arrayLine = inputArray[line];
        for (let index = 0; index < arrayLine.length; index++){ // for each element of the row
          let localPathValue = arrayLine[index]; // get that value...
          let minElementAbove = Math.min(inputArray[line - 1][index], inputArray[line - 1][index + 1]) // get the minimum of the elements above this value.
          arrayLine[index] = localPathValue + minElementAbove; // update local value
        }
      }
      let minPath = inputArray.pop()[0]; // the 'last' element, aka top of pyramid, is a one-number array holding minimum path value.
      //ns.tprint(localValue);
      reward = await easyRun(ns, "codingcontract/attempt", minPath, contractName, contractHost);
      break;

    case "Unique Paths in a Grid I":
      inputArray = contractData;

      let gridIRows = inputArray[0];
      let gridIColumns = inputArray[1];

      // is recursion the answer? (yes! WOO!)
      function uniquePathsOne(position = [0,0]){
        let rowPosition = position[0];
        let columnPosition = position[1];

        let uniquePaths = 0;

        if (rowPosition == gridIRows - 1 && columnPosition == gridIColumns - 1) return 1;

        if (rowPosition < gridIRows - 1){
          uniquePaths += uniquePathsOne([rowPosition + 1, columnPosition]) // and however many paths are down this path...
        } else { return 1;}  // there is one unique path remaining: down.

        if (columnPosition < gridIColumns - 1){
          uniquePaths += uniquePathsOne([rowPosition, columnPosition + 1])
        } else { return 1;}  // there is one unique path remaining: right.

        return uniquePaths;
      }
      let uniquePathsInGridI = uniquePathsOne();
      //ns.tprint(uniquePathsInGridI);
      reward = await easyRun(ns, "codingcontract/attempt", uniquePathsInGridI, contractName, contractHost);
      break;

    case "Unique Paths in a Grid II":
      inputArray = contractData;
      let gridIIrows = inputArray.length;
      let gridIIcolumns = inputArray[0].length;

      function uniquePathsTwo(position = [0,0]){
        let rowPosition = position[0];
        let columnPosition = position[1];

        if (inputArray[0][0] === 1) return 0; // obstacle on spawn?

        let uniquePaths = 0;

        // if we have reached the end point
        if (rowPosition == gridIIrows - 1 && columnPosition == gridIIcolumns - 1) return 1;

        let canGoRight = columnPosition < gridIIcolumns - 1 && inputArray[rowPosition][columnPosition + 1] !== 1;
        let canGoDown = rowPosition < gridIIrows - 1 && inputArray[rowPosition + 1][columnPosition] !== 1;

        // if we can, explore right and down paths.
        if (canGoRight) {
          uniquePaths = uniquePaths + uniquePathsTwo([rowPosition, columnPosition + 1])
        }
        if (canGoDown) {
          uniquePaths = uniquePaths + uniquePathsTwo([rowPosition + 1, columnPosition])
        }
        return uniquePaths;
      }
      let uniquePathsInGridII = uniquePathsTwo();
      //ns.tprint(uniquePathsInGridII);
      reward = await easyRun(ns, "codingcontract/attempt", uniquePathsInGridII, contractName, contractHost);
      break;

    case "Shortest Path in a Grid":
      inputArray = contractData;
      let gridIIIrows = inputArray.length;
      let gridIIIcolumns = inputArray[0].length;

      function findShortestPath() {
        let rows = gridIIIrows;
        let cols = gridIIIcolumns;
        let directions = [[1, 0, 'D'], [0, 1, 'R'], [-1, 0, 'U'], [0, -1, 'L']];
        let visited = Array.from({ length: rows }, () => Array(cols).fill(false));

        let queue = [[[0, 0], '']]; // Each element in queue: [[row, col], path]

        while (queue.length > 0) {
          let [[row, col], path] = queue.shift();

          // Check for the destination
          if (row === rows - 1 && col === cols - 1) {
            return path;
          }

          // Explore neighbors
          for (let [dr, dc, dir] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && 
              inputArray[newRow][newCol] === 0 && !visited[newRow][newCol]) {
              visited[newRow][newCol] = true;
              queue.push([[newRow, newCol], path + dir]);
            }
          }
        }

        // No path found
        return '';
      }
      let shortestParth = findShortestPath()
      //ns.tprint(shortestParth);
      reward = await easyRun(ns, "codingcontract/attempt", shortestParth, contractName, contractHost);
      break;

    case "Sanitize Parentheses in Expression":
      inputString = contractData;
      function isValid(inString) {
        let balance = 0;
        for (let character of inString) {
          if (character === '(') {
            balance++;
          } else if (character === ')') {
            if (balance === 0) return false;
            balance--;
          }
        }
        return balance === 0;
      }

      let queue = [inputString];
      let visited = new Set();
      let found = false;
      let validExpressions = new Set();

      while (queue.length) {
        let levelSize = queue.length;
        found = false;
        for (let i = 0; i < levelSize; i++) {
          let s = queue.shift();
          if (isValid(s)) { validExpressions.add(s); found = true; }
          if (!found) {
            for (let j = 0; j < s.length; j++) {
              if (s[j] !== '(' && s[j] !== ')') continue;
              let newStr = s.substring(0, j) + s.substring(j + 1);
              if (!visited.has(newStr)) {
                queue.push(newStr);
                visited.add(newStr);
              }
            }
          }
        }
        if (found) break;
      }

      //ns.tprint(`ValidExpressions: ${[...validExpressions].join(', ')}`);
      reward = await easyRun(ns, "codingcontract/attempt", JSON.stringify([...validExpressions]), contractName, contractHost);
      break;

    

    /*
    case "Find All Valid Math Expressions":
      
      You are given the following string which contains only digits between 0 and 9:

      57860268

      You are also given a target number of -40. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)

      The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:

      ["57860268", -40]

      NOTE: The order of evaluation expects script operator precedence NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression Examples:

      Input: digits = "123", target = 6
      Output: [1+2+3, 1*2*3]

      Input: digits = "105", target = 5
      Output: [1*0+5, 10-5]
      

      // just brute force combinations? that seems INSANELY inefficient?
      //ns.tprint(description)
      break;
    */

    /*
    case "HammingCodes: Integer to Encoded Binary":
      
      You are given the following decimal Value:  32773630772223296 
      Convert it to a binary representation and encode it as an 'extended Hamming code'. Eg:
        Value 8 is expressed in binary as '1000', which will be encoded with the pattern 'pppdpddd', where p is a parity bit and d a data bit. The encoding of
      8 is 11110000. As another example, '10101' (Value 21) will result into (pppdpdddpd) '1001101011'.
      The answer should be given as a string containing only 1s and 0s.
      NOTE: the endianness of the data bits is reversed in relation to the endianness of the parity bits.
      NOTE: The bit at index zero is the overall parity bit, this should be set last.
      NOTE 2: You should watch the Hamming Code video from 3Blue1Brown, which explains the 'rule' of encoding, including the first index parity bit mentioned in the previous note.

      Extra rule for encoding:
      There should be no leading zeros in the 'data bit' section
      cct-solver.js: Contract: HammingCodes: Integer to Encoded Binary at univ-energy
      cct-solver.js: Failed to solve contract. Remaining attempts: 10
      cct-solver.js: You are given the following decimal Value: 
      1702027912 
      Convert it to a binary representation and encode it as an 'extended Hamming code'. Eg:
        Value 8 is expressed in binary as '1000', which will be encoded with the pattern 'pppdpddd', where p is a parity bit and d a data bit. The encoding of
      8 is 11110000. As another example, '10101' (Value 21) will result into (pppdpdddpd) '1001101011'.
      The answer should be given as a string containing only 1s and 0s.
      NOTE: the endianness of the data bits is reversed in relation to the endianness of the parity bits.
      NOTE: The bit at index zero is the overall parity bit, this should be set last.
      NOTE 2: You should watch the Hamming Code video from 3Blue1Brown, which explains the 'rule' of encoding, including the first index parity bit mentioned in the previous note.

      Extra rule for encoding:
      There should be no leading zeros in the 'data bit' section
      
      ns.tprint(description)
      break;

    */

    case "Encryption I: Caesar Cipher":
      inputString = contractData.shift(); // all uppercase
      inputNumber = contractData.shift();

      function caesarCipher(str, shift) {
        let result = "";
        shift = (26 - shift) % 26;
        for (let i = 0; i < str.length; i++) {
          let char = str[i];
          // Check if character is an uppercase letter
          if (char >= 'A' && char <= 'Z') {
            let code = str.charCodeAt(i);
            // Shift character and wrap around if necessary
            char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
          }
          result += char;
        }
        return result;
      }

      let encryptedString = caesarCipher(inputString, inputNumber);
      //ns.tprint(encryptedString);
      reward = await easyRun(ns, "codingcontract/attempt", encryptedString, contractName, contractHost);

      break;

    default: // -----------------------------------------------------------------------------------
      //ns.tprint("DEFAULTING!");
      defaulting = true;
  }

  if (reward) { 
    ns.tprint(`Contract: ${contractType} at ${contractHost} solved successfully! Reward: ${reward}`) 
  }  
  else if (!defaulting){
    ns.tprint(`Contract: ${contractType} at ${contractHost}`);
    let remainingTries = await easyRun(ns, "codingcontract/getNumTriesRemaining", contractName, contractHost)
    ns.tprint(`Failed to solve contract. Remaining attempts: ${remainingTries}`);
  }
  
}
